const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataPointSchema = new mongoose.Schema({
    value: Number,
    date: { type: Date, default: Date.now }
});

// Define the User Schema
const userSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    age:{
        type: Number,
    },
    gender:{
        type: String,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
        type: String
    },
    period: [{
        start: Date,
        end: Date
    }],
    sleepDuration: [dataPointSchema],
    waterIntake: [dataPointSchema],
    meditationDuration: [dataPointSchema],
    physicalActivity: [dataPointSchema],
    dailyTaskCompletions: [{
    date: { type: Date, default: Date.now },
    completedTasks: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 }
}],

// Add this to your user.js schema:
tasks: [{
    id: String,
    name: { type: String, required: true },
    type: { type: String, enum: ['videos', 'blogs', 'books', 'podcasts'], required: true },
    category: String,
    completed: { type: Boolean, default: false },
    priority: String,
    duration: String,
    author: String,
    readTime: String,
    host: String,
    createdAt: { type: Date, default: Date.now }
}],

pssScore: [dataPointSchema],

assessmentHistory: [{
    type: {
        type: String,
        enum: ['gad7', 'phq9', 'ghq12', 'pss', 'comprehensive']
    },
    score: Number,
    riskLevel: {
        type: String,
        enum: ['low', 'moderate', 'critical']
    },
    date: {
        type: Date,
        default: Date.now
    }
}]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;