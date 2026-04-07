const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    category: {
        type: String, // Kept as string for backward compatibility/quick selection, but will link to Category name
        required: [true, 'Please add a category']
    },
    categoryId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    priority: {
        type: String,
        required: [true, 'Please add priority'],
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'Assigned', 'In Progress', 'Waiting for User', 'Resolved', 'Closed', 'Reopened', 'Rejected'],
        default: 'Open'
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    assignedBy: {
        type: String, // "system" or User Name
        default: null
    },
    assignedById: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    assignedAt: {
        type: Date,
        default: null
    },
    slaDeadline: {
        type: Date
    },
    dueDate: {
        type: Date
    },
    resolutionTime: {
        type: Number // Time in minutes or hours to resolve
    },
    resolutionRemarks: {
        type: String,
        default: ''
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    feedback: {
        type: String,
        default: ''
    },
    isFeedbackSubmitted: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    remarks: {
        type: String,
        default: ''
    },
    isRated: {
        type: Boolean,
        default: false
    },
    isBreached: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance (ticketNumber is already unique, so index is created automatically)
// RequestSchema.index({ ticketNumber: 1 });
RequestSchema.index({ assignedTo: 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ priority: 1 });

// Update the updatedAt field on save
RequestSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Request', RequestSchema);
