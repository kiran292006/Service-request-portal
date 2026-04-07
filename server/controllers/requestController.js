const Request = require('../models/Request');
const User = require('../models/User');
const Category = require('../models/Category');
const TicketActivity = require('../models/TicketActivity');
const Notification = require('../models/Notification');
const { generateTicketNumber } = require('../utils/generateTicket');

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res, next) => {
    try {
        const { title, description, category, priority } = req.body;

        // Generate unique ticket number
        const ticketNumber = await generateTicketNumber();

        // Calculate SLA Deadline (Rules: High -> 24h, Medium -> 48h, Low/Other -> 72h, Critical -> 4h)
        let slaHours = 72; // Default Low
        if (priority === 'Medium') slaHours = 48;
        if (priority === 'High') slaHours = 24;
        if (priority === 'Critical') slaHours = 4;

        const slaDeadline = new Date();
        slaDeadline.setHours(slaDeadline.getHours() + slaHours);
        const dueDate = new Date(slaDeadline);

        const requestData = {
            ticketNumber,
            title,
            description,
            category,
            priority,
            userId: req.user.id,
            slaDeadline,
            dueDate,
            status: 'Open'
        };

        // Handle image upload
        if (req.file) {
            requestData.image = `/uploads/requests/${req.file.filename}`;
        }

        // Auto Assignment Logic
        // 1. Find the category in the database
        const categoryDoc = await Category.findOne({ name: category });
        let candidateTechnicians = [];

        if (categoryDoc && categoryDoc.assignedTechnicians.length > 0) {
            // Find technicians linked to this category
            candidateTechnicians = await User.find({
                _id: { $in: categoryDoc.assignedTechnicians },
                role: 'technician'
            });
            requestData.categoryId = categoryDoc._id;
        }

        // 2. Fallback to all technicians if no category-specific ones found
        if (candidateTechnicians.length === 0) {
            candidateTechnicians = await User.find({ role: 'technician' });
        }

        if (candidateTechnicians.length > 0) {
            // Find the technician among candidates with the lowest workload
            const techStats = await Promise.all(candidateTechnicians.map(async (tech) => {
                const count = await Request.countDocuments({ assignedTo: tech._id, status: { $ne: 'Closed' } });
                return { tech, count };
            }));

            techStats.sort((a, b) => a.count - b.count);
            const bestTech = techStats[0].tech;

            requestData.assignedTo = bestTech._id;
            requestData.assignedAt = Date.now();
            requestData.assignedBy = 'system';
            requestData.status = 'Assigned';
        }

        const request = await Request.create(requestData);
        await request.populate('assignedTo userId');

        // Log Activity: Ticket Created
        await TicketActivity.create({
            requestId: request._id,
            action: 'Ticket Created',
            performedBy: req.user.id,
            details: `Ticket created with priority ${priority}`
        });

        // Log Activity: Technician Assigned
        if (request.assignedTo) {
            await TicketActivity.create({
                requestId: request._id,
                action: 'Technician Assigned',
                performedBy: req.user.id, // System assignment often performedBy the creator or a system ID
                details: `Automatically assigned to technician ${requestData.assignedTo}`
            });

            // NOTIFY TECHNICIAN
            const techNotif = await Notification.create({
                recipientId: request.assignedTo._id || request.assignedTo,
                senderId: req.user.id, // System assignment initiated by user
                requestId: request._id,
                message: `New ticket ${request.ticketNumber} auto-assigned to you.`,
                type: 'reassigned'
            });
            const techId = (request.assignedTo._id || request.assignedTo).toString();
            req.io.to(techId).emit('notification', techNotif);
        }

        res.status(201).json({
            success: true,
            data: request
        });
    } catch (err) {
        console.error('CRITICAL: Submission error details:', err);
        res.status(500).json({
            success: false,
            error: err.message || 'Server Error'
        });
    }
};

// @desc    Get all requests for logged in user
// @route   GET /api/requests
// @access  Private
exports.getMyRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ userId: req.user.id })
            .populate({ path: 'assignedTo', select: 'name' })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate({ path: 'userId', select: 'name email' })
            .populate({ path: 'assignedTo', select: 'name email' });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        // Make sure user owns request, is admin/manager, or is assigned technician
        const isOwner = request.userId._id.toString() === req.user.id;
        const isAdminOrManager = req.user.role === 'admin' || req.user.role === 'manager';
        const isAssignedTech = request.assignedTo && (request.assignedTo._id || request.assignedTo).toString() === req.user.id;

        if (!isOwner && !isAdminOrManager && !isAssignedTech) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this request'
            });
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Submit feedback/rating for a closed request
// @route   PUT /api/requests/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res, next) => {
    try {
        let request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        // Make sure user is the one who created the request
        if (request.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized to provide feedback' });
        }

        // Only allow feedback for Resolved or Closed tickets
        if (request.status !== 'Resolved' && request.status !== 'Closed') {
            return res.status(400).json({ success: false, error: 'Feedback can only be submitted for resolved or closed tickets' });
        }

        const { rating, feedback } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Please provide a rating between 1 and 5' });
        }

        if (request.isRated) {
            return res.status(400).json({ success: false, error: 'Feedback already submitted for this ticket' });
        }

        request.rating = rating;
        request.feedback = feedback;
        request.isFeedbackSubmitted = true;
        request.isRated = true;

        // Award Points to technician
        if (request.assignedTo) {
            const tech = await User.findById(request.assignedTo);
            if (tech && tech.role === 'technician') {
                const pointMap = { 5: 10, 4: 7, 3: 5, 2: 2, 1: 0 };
                const pointsToAdd = pointMap[rating] || 0;
                
                tech.points = (tech.points || 0) + pointsToAdd;
                await tech.save();

                // Log Point Activity
                await TicketActivity.create({
                    requestId: request._id,
                    action: 'Points Awarded',
                    performedBy: req.user.id,
                    details: `${pointsToAdd} points awarded to ${tech.name} for ${rating}-star rating.`
                });
            }
        }

        // Auto-close if it was Resolved
        if (request.status === 'Resolved') {
            request.status = 'Closed';
        }

        await request.save();

        await TicketActivity.create({
            requestId: request._id,
            action: 'Feedback Submitted',
            performedBy: req.user.id,
            details: `Rating: ${rating}/5, Feedback: ${feedback || 'None'}`
        });

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (err) {
        next(err);
    }
};
