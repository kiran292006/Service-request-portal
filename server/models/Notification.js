const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    requestId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Request',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['status_change', 'new_comment', 'resolved', 'sla_warning', 'reassigned'],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
