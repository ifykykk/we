const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Flagged Case Schema
const flaggedCaseSchema = new Schema({
    studentId: {
        type: String,
        required: true,
        ref: 'User'
    },
    anonymizedId: {
        type: String,
        required: true,
        unique: true
    },
    department: String,
    year: String,
    semester: String,
    riskLevel: {
        type: String,
        enum: ['low', 'moderate', 'high', 'critical'],
        required: true
    },
    flaggedFor: [{
        type: String,
        enum: [
            'depression', 
            'anxiety', 
            'stress', 
            'burnout', 
            'suicidal_thoughts', 
            'self_harm',
            'severe_depression',
            'emotional_distress',
            'severe_emotional_distress'
        ]
    }],
    screeningScores: {
        pss: Number,
        phq9: Number,
        gad7: Number,
        ghq: Number,
        ghq12: Number,
        assessmentType: String
    },
    assignedCounsellor: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in_progress', 'completed', 'escalated'],
        default: 'pending'
    },
    notes: String,
    followUpRequired: {
        type: Boolean,
        default: true
    },
    lastContactDate: Date,
    nextFollowUpDate: Date
}, { timestamps: true });

const FlaggedCase = mongoose.model('FlaggedCase', flaggedCaseSchema);
module.exports = FlaggedCase;
