const Comment = require('../models/Comment');
const Request = require('../models/Request');
const TicketActivity = require('../models/TicketActivity');

// @desc    Add comment to request
// @route   POST /api/comments
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const { ticketId, message } = req.body;

        const request = await Request.findById(ticketId);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Request not found'
            });
        }

        // Check ownership, admin, or assigned technician
        const isOwner = request.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const isTechnician = req.user.role === 'technician' && request.assignedTo?.toString() === req.user.id;

        if (!isOwner && !isAdmin && !isTechnician) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to comment on this request'
            });
        }

        const comment = await Comment.create({
            ticketId,
            message,
            userId: req.user.id,
            userName: req.user.name
        });

        // Log Activity
        await TicketActivity.create({
            requestId: ticketId,
            action: 'Comment Added',
            performedBy: req.user.id,
            details: `${req.user.name} added a comment`
        });

        // Notify user/admin
        const Notification = require('../models/Notification');
        if (req.user.role === 'admin' || req.user.role === 'technician') {
            const notif = await Notification.create({
                recipientId: request.userId,
                senderId: req.user.id,
                requestId: request._id,
                message: `${req.user.role === 'admin' ? 'Admin' : 'Technician'} commented on your ticket ${request.ticketNumber}`,
                type: 'new_comment'
            });
            req.io.to(request.userId.toString()).emit('notification', notif);
        }

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get comments for a request
// @route   GET /api/comments/:ticketId
// @access  Private
exports.getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ ticketId: req.params.ticketId }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (err) {
        next(err);
    }
};
