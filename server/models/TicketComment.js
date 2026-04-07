const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Request',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TicketComment', CommentSchema);
