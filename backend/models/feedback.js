const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Feedback Schema
const feedbackSchema = new Schema({
    studentId: {
        type: String,
        ref: 'User'
    },
    isAnonymous: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['platform', 'counselling', 'resources', 'general', 'technical'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        required: true
    },
    sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative']
    },
    status: {
        type: String,
        enum: ['new', 'reviewed', 'addressed', 'dismissed'],
        default: 'new'
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    response: String,
    tags: [String]
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
