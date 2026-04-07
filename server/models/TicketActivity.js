const mongoose = require('mongoose');

const TicketActivitySchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Request',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'Ticket Created',
            'Technician Assigned',
            'Assignment Overridden',
            'Ticket Reassigned',
            'Work Started',
            'Waiting for User',
            'Issue Resolved',
            'Ticket Closed',
            'Comment Added',
            'Status Updated',
            'Resolution Remarks Added',
            'Feedback Submitted'
        ]
    },
    performedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    details: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TicketActivity', TicketActivitySchema);
