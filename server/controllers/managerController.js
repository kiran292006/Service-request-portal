const Request = require('../models/Request');
const User = require('../models/User');
const TicketActivity = require('../models/TicketActivity');
const Notification = require('../models/Notification');

// @desc    Get manager dashboard analytics
// @route   GET /api/manager/analytics
// @access  Private/Manager/Admin
exports.getManagerAnalytics = async (req, res, next) => {
    try {
        const totalActive = await Request.countDocuments({ status: { $ne: 'Closed' } });
        const slaBreaches = await Request.countDocuments({
            slaDeadline: { $lt: new Date() },
            status: { $nin: ['Resolved', 'Closed'] }
        });

        // Technician Performance: Resolved per technician
        const techPerformance = await Request.aggregate([
            { $match: { status: { $in: ['Resolved', 'Closed'] }, assignedTo: { $ne: null } } },
            {
                $group: {
                    _id: '$assignedTo',
                    count: { $sum: 1 },
                    avgResolutionTime: { $avg: '$resolutionTime' },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Populate tech names, points, and specialties (Categories)
        const populatedTechs = await User.populate(techPerformance, { path: '_id', select: 'name email points specialties' });

        // Active tickets per technician
        const activeTicketsPerTech = await Request.aggregate([
            { $match: { status: { $nin: ['Resolved', 'Closed', 'Rejected'] }, assignedTo: { $ne: null } } },
            { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
        ]);
        const populatedActiveTechs = await User.populate(activeTicketsPerTech, { path: '_id', select: 'name email points specialties' });

        res.status(200).json({
            success: true,
            data: {
                totalActive,
                slaBreaches,
                techPerformance: populatedTechs,
                activeTicketsPerTech: populatedActiveTechs
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all requests (Manager View)
// @route   GET /api/manager/requests
// @access  Private/Manager/Admin
exports.getManagerRequests = async (req, res, next) => {
    try {
        // Similar to getAllRequests but for managers
        const requests = await Request.find()
            .populate({ path: 'userId', select: 'name email' })
            .populate({ path: 'assignedTo', select: 'name email' })
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

// @desc    Reassign ticket
// @route   PUT /api/manager/requests/:id/reassign
// @access  Private/Manager/Admin
exports.reassignTicket = async (req, res, next) => {
    try {
        const { assignedTo } = req.body;
        let request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        const oldTechId = request.assignedTo;
        request.assignedTo = assignedTo;
        request.assignedBy = req.user.name;
        request.assignedById = req.user.id;
        request.assignedAt = Date.now();

        if (request.status === 'Open') {
            request.status = 'Assigned';
        }

        await request.save();

        // Log Activity
        await TicketActivity.create({
            requestId: request._id,
            action: 'Ticket Reassigned',
            performedBy: req.user.id,
            details: `Reassigned from ${oldTechId || 'None'} to ${assignedTo}`
        });

        // Notify Technician
        const techNotif = await Notification.create({
            recipientId: assignedTo,
            senderId: req.user.id,
            requestId: request._id,
            message: `Ticket ${request.ticketNumber} has been reassigned to you by a manager.`,
            type: 'reassigned'
        });
        req.io.to(assignedTo.toString()).emit('notification', techNotif);

        // Notify User
        const userNotif = await Notification.create({
            recipientId: request.userId._id || request.userId,
            senderId: req.user.id,
            requestId: request._id,
            message: `Your request ${request.ticketNumber} has been reassigned to a new technician.`,
            type: 'reassigned'
        });
        const recipientUserId = (request.userId._id || request.userId).toString();
        req.io.to(recipientUserId).emit('notification', userNotif);

        await request.populate('assignedTo userId');

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (err) {
        next(err);
    }
};
