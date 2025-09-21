const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Counsellor Profile Schema
const counsellorProfileSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        unique: true
    },
    specializations: [{
        type: String,
        enum: [
            'anxiety_disorders',
            'depression',
            'stress_management',
            'academic_pressure',
            'relationship_counseling',
            'career_guidance',
            'trauma_therapy',
            'addiction_counseling',
            'eating_disorders',
            'grief_counseling',
            'anger_management',
            'sleep_disorders',
            'general_counseling'
        ]
    }],
    qualifications: [{
        degree: String,
        institution: String,
        year: Number,
        certification: String
    }],
    experience: {
        type: Number, // years of experience
        default: 0
    },
    biography: {
        type: String,
        maxlength: 1000
    },
    languages: [{
        type: String,
        default: ['English']
    }],
    availability: {
        monday: {
            available: { type: Boolean, default: false },
            startTime: String,
            endTime: String,
            maxBookings: { type: Number, default: 4 }
        },
        tuesday: {
            available: { type: Boolean, default: false },
            startTime: String,
            endTime: String,
            maxBookings: { type: Number, default: 4 }
        },
        wednesday: {
            available: { type: Boolean, default: false },
            startTime: String,
            endTime: String,
            maxBookings: { type: Number, default: 4 }
        },
        thursday: {
            available: { type: Boolean, default: false },
            startTime: String,
            endTime: String,
            maxBookings: { type: Number, default: 4 }
        },
        friday: {
            available: { type: Boolean, default: false },
            startTime: String,
            endTime: String,
            maxBookings: { type: Number, default: 4 }
        },
        saturday: {
            available: { type: Boolean, default: false },
            startTime: String,
            endTime: String,
            maxBookings: { type: Number, default: 2 }
        },
        sunday: {
            available: { type: Boolean, default: false },
            startTime: String,
            endTime: String,
            maxBookings: { type: Number, default: 2 }
        }
    },
    isAcceptingBookings: {
        type: Boolean,
        default: true
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    consultationFee: {
        type: Number,
        default: 0 // 0 for free institutional counseling
    },
    rating: {
        average: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 }
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    emergencyAvailable: {
        type: Boolean,
        default: false
    },
    officeLocation: {
        building: String,
        room: String,
        floor: String,
        additionalInfo: String
    },
    contactInfo: {
        officePhone: String,
        emergencyContact: String,
        officeHours: String
    }
}, { 
    timestamps: true 
});

// Virtual to check if profile is complete
counsellorProfileSchema.virtual('profileCompleteness').get(function() {
    let completeness = 0;
    const fields = ['specializations', 'qualifications', 'biography', 'availability'];
    
    fields.forEach(field => {
        if (field === 'specializations' && this.specializations && this.specializations.length > 0) {
            completeness += 25;
        } else if (field === 'qualifications' && this.qualifications && this.qualifications.length > 0) {
            completeness += 25;
        } else if (field === 'biography' && this.biography && this.biography.length > 50) {
            completeness += 25;
        } else if (field === 'availability') {
            const availableDays = Object.values(this.availability || {}).filter(day => day.available);
            if (availableDays.length > 0) {
                completeness += 25;
            }
        }
    });
    
    return completeness;
});

// Update profile completion status before saving
counsellorProfileSchema.pre('save', function(next) {
    this.isProfileComplete = this.profileCompleteness >= 75;
    next();
});

// Add indexes
counsellorProfileSchema.index({ isAcceptingBookings: 1, isProfileComplete: 1 });
counsellorProfileSchema.index({ specializations: 1 });

const CounsellorProfile = mongoose.model('CounsellorProfile', counsellorProfileSchema);
module.exports = CounsellorProfile;
