const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Booking Schema
const bookingSchema = new Schema({
    studentId: {
        type: String,
        required: true,
        ref: 'User'
    },
    studentInfo: {
        firstName: String,
        lastName: String,
        email: String,
        clerkId: String
    },
    counsellorId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    counsellorInfo: {
        firstName: String,
        lastName: String,
        email: String,
        department: String
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['online', 'offline'],
        required: true,
        default: 'online'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    ticketId: {
        type: String,
        unique: true
    },
    reason: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    notes: {
        type: String,
        maxlength: 500
    },
    counsellorNotes: {
        type: String,
        maxlength: 1000
    },
    rejectionReason: {
        type: String,
        maxlength: 500
    },
    confidentialityLevel: {
        type: String,
        enum: ['standard', 'high', 'critical'],
        default: 'standard'
    },
    sessionType: {
        type: String,
        enum: ['individual', 'group', 'emergency'],
        default: 'individual'
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    nextFollowUpDate: Date,
    completedAt: Date,
    confirmedAt: Date,
    rejectedAt: Date
}, { 
    timestamps: true 
});

// Generate unique ticket ID before saving
bookingSchema.pre('save', function(next) {
    if (!this.ticketId) {
        const date = new Date();
        const dateStr = date.getFullYear().toString().substr(-2) + 
                       String(date.getMonth() + 1).padStart(2, '0') + 
                       String(date.getDate()).padStart(2, '0');
        const timeStr = String(date.getHours()).padStart(2, '0') + 
                       String(date.getMinutes()).padStart(2, '0');
        const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
        
        this.ticketId = `BK-${dateStr}-${timeStr}-${randomStr}`;
    }
    next();
});

// Add indexes for better performance
bookingSchema.index({ studentId: 1, createdAt: -1 });
bookingSchema.index({ counsellorId: 1, status: 1 });
bookingSchema.index({ appointmentDate: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
