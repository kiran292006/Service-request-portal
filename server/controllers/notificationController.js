const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (err) { next(err); }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        const userId = (req.user._id || req.user.id).toString();
        if (notification.recipientId.toString() !== userId) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (err) { next(err); }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
        await Notification.updateMany(
            { recipientId: userId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) { next(err); }
};

// @desc    Delete all notifications
// @route   DELETE /api/notifications/clear/all
// @access  Private
exports.deleteAllNotifications = async (req, res, next) => {
    try {
        const userRef = req.user._id || req.user.id;

        const result = await Notification.deleteMany({ 
            recipientId: new mongoose.Types.ObjectId(userRef) 
        });


        res.status(200).json({
            success: true,
            message: 'All notifications deleted',
            count: result.deletedCount
        });
    } catch (err) {
        console.error('PURGE ERROR:', err);
        res.status(500).json({ success: false, error: 'Database purge failed.' });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        const userId = (req.user._id || req.user.id).toString();
        if (notification.recipientId.toString() !== userId) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await Notification.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error('DELETE ERROR:', err);
        res.status(500).json({ success: false, error: 'Delete failed.' });
    }
};
