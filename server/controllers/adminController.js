const Request = require('../models/Request');
const User = require('../models/User');
const TicketActivity = require('../models/TicketActivity');
const Notification = require('../models/Notification');

// @desc    Get all requests for assigned technician
// @route   GET /api/admin/technician/tickets
// @access  Private/Technician
exports.getTechnicianTickets = async (req, res, next) => {
    try {
        const requests = await Request.find({ assignedTo: req.user.id })
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

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private/Admin
exports.getAllRequests = async (req, res, next) => {
    try {
        const { status, priority, category, ticketNumber, email } = req.query;
        let query = {};

        // Filtering
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;
        if (ticketNumber) query.ticketNumber = new RegExp(ticketNumber, 'i');

        // Filter by user email
        if (email) {
            const user = await User.findOne({ email });
            if (user) {
                query.userId = user._id;
            } else {
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
        }

        const requests = await Request.find(query)
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

// @desc    Update request status/remarks
// @route   PUT /api/admin/requests/:id
// @access  Private/Admin
exports.updateRequest = async (req, res, next) => {
    try {
        let request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        const userRole = req.user.role;
        const userId = req.user.id.toString();
        const oldStatus = request.status;
        const { status, assignedTo, resolutionRemarks, remarks } = req.body;

        // --- 1. Role-Based Access Control ---

        // ADMIN & MANAGER: Full Access
        const isManagerOrAdmin = ['admin', 'manager'].includes(userRole);

        // TECHNICIAN: Access only if assigned
        const isAssignedTech = userRole === 'technician' && request.assignedTo && request.assignedTo.toString() === userId;

        // USER: Access only if creator
        const isCreator = userRole === 'user' && request.userId.toString() === userId;

        if (!isManagerOrAdmin && !isAssignedTech && !isCreator) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this request'
            });
        }

        // --- 2. Permission Logic for Status Changes ---
        if (status && status !== oldStatus) {
            let allowed = false;

            if (isManagerOrAdmin) {
                allowed = true; // Managers/Admins can do anything
            } else if (isAssignedTech) {
                // Technicians can progress work or resolve
                const techAllowedStatuses = ['In Progress', 'Waiting for User', 'Resolved', 'Assigned'];
                if (techAllowedStatuses.includes(status)) {
                    allowed = true;
                }
            } else if (isCreator) {
                // Users can only Close or Reopen a RESOLVED ticket
                if (oldStatus === 'Resolved' && ['Closed', 'Reopened'].includes(status)) {
                    allowed = true;
                }
            }

            if (!allowed) {
                return res.status(400).json({
                    success: false,
                    error: `Role ${userRole} is not allowed to change status from ${oldStatus} to ${status}`
                });
            }

            // Apply status change
            request.status = status;

            // Special logic for Resolved
            if (status === 'Resolved') {
                const diff = (Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60); // minutes
                request.resolutionTime = Math.round(diff);
                request.resolvedAt = Date.now();
            }

            // Log Activity
            await TicketActivity.create({
                requestId: request._id,
                action: 'Status Updated',
                performedBy: req.user.id,
                details: `Status changed from ${oldStatus} to ${status}`
            });

            // CREATE NOTIFICATION for User (if tech/manager updated it)
            if (!isCreator) {
                const targetUserId = (request.userId._id || request.userId).toString();
                const notif = await Notification.create({
                    recipientId: targetUserId,
                    senderId: req.user.id,
                    requestId: request._id,
                    message: `Your ticket ${request.ticketNumber} status has been updated to ${status}.`,
                    type: 'status_change'
                });

                req.io.to(targetUserId).emit('notification', notif);
            }
        }

        // --- 3. Permission Logic for Assignment ---
        if (assignedTo) {
            if (!isManagerOrAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Only managers and admins can reassign technicians'
                });
            }

            const isOverride = request.assignedTo ? true : false;
            const oldTechId = request.assignedTo;
            request.assignedTo = assignedTo;
            request.assignedBy = req.user.name; // Use human name
            request.assignedById = req.user.id;
            request.assignedAt = Date.now();

            if (request.status === 'Open') {
                request.status = 'Assigned';
            }

            await TicketActivity.create({
                requestId: request._id,
                action: isOverride ? 'Assignment Overridden' : 'Technician Assigned',
                performedBy: req.user.id,
                details: `Assigned to technician ${assignedTo}`
            });

            // NOTIFY NEW TECHNICIAN
            const techNotif = await Notification.create({
                recipientId: assignedTo,
                senderId: req.user.id,
                requestId: request._id,
                message: `New ticket ${request.ticketNumber} assigned to you.`,
                type: 'reassigned'
            });
            req.io.to(assignedTo.toString()).emit('notification', techNotif);
        }

        // --- 4. Remarks & Resolution Logic ---
        if (resolutionRemarks !== undefined) {
            // Only tech or manager can add resolution remarks
            if (!isAssignedTech && !isManagerOrAdmin) {
                return res.status(403).json({ success: false, error: 'Not authorized to add resolution remarks' });
            }
            request.resolutionRemarks = resolutionRemarks;

            if (resolutionRemarks && status === 'Resolved') {
                await TicketActivity.create({
                    requestId: request._id,
                    action: 'Resolution Remarks Added',
                    performedBy: req.user.id,
                    details: 'Resolution details provided.'
                });
            }
        }

        if (remarks !== undefined) {
            // Anyone with access can add internal remarks (except users maybe?)
            if (isCreator) {
                return res.status(403).json({ success: false, error: 'Users cannot add internal remarks' });
            }
            request.remarks = remarks;
        }

        await request.save();
        await request.populate('assignedTo userId');

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
    try {
        const total = await Request.countDocuments();
        const resolved = await Request.countDocuments({ status: 'Resolved' });
        const rejected = await Request.countDocuments({ status: 'Rejected' });
        const closed = await Request.countDocuments({ status: 'Closed' });
        const assigned = await Request.countDocuments({ status: 'Assigned' });
        const open = await Request.countDocuments({ status: 'Open' });
        const inProgress = await Request.countDocuments({ status: 'In Progress' });
        const critical = await Request.countDocuments({ priority: 'Critical' });

        const totalActive = await Request.countDocuments({ status: { $ne: 'Closed' } });
        const slaBreaches = await Request.countDocuments({
            slaDeadline: { $lt: now },
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

        // Aggregate by status for charts
        const statsByStatus = await Request.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Aggregate by priority
        const statsByPriority = await Request.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        // Aggregate by category
        const statsByCategory = await Request.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Get 5 most recent requests
        const recentRequests = await Request.find()
            .populate({ path: 'userId', select: 'name email' })
            .populate({ path: 'assignedTo', select: 'name email' })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                total,
                open,
                assigned,
                inProgress,
                resolved,
                closed,
                rejected,
                critical,
                totalActive,
                slaBreaches,
                techPerformance: populatedTechs,
                activeTicketsPerTech: populatedActiveTechs,
                statsByStatus,
                statsByPriority,
                statsByCategory,
                recentRequests
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, specialties } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Email already in use' });
        }
        const user = await User.create({ name, email, password, role: role || 'user', specialties: specialties || [] });
        res.status(201).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user (email, password, role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, password, role, specialties } = req.body;
        const user = await User.findById(req.params.id).select('+password');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (name) user.name = name;
        if (role) user.role = role;
        if (specialties !== undefined) user.specialties = specialties;
        if (email && email !== user.email) {
            const clash = await User.findOne({ email });
            if (clash) return res.status(400).json({ success: false, error: 'Email already in use' });
            user.email = email;
        }
        if (password && password.length >= 6) {
            user.password = password; // pre-save hook will hash it
        }
        await user.save();
        res.status(200).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};


// @desc    Delete request
// @route   DELETE /api/admin/requests/:id
// @access  Private/Admin
exports.deleteRequest = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        await Request.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
// @desc    Get ticket activity
// @route   GET /api/admin/requests/:id/activity
// @access  Private
exports.getActivity = async (req, res, next) => {
    try {
        const activities = await TicketActivity.find({ requestId: req.params.id })
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (err) {
        next(err);
    }
};
