const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Resource Schema
const resourceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['video', 'audio', 'document', 'guide', 'article'],
        required: true
    },
    category: {
        type: String,
        enum: ['anxiety', 'depression', 'stress', 'meditation', 'exercise', 'nutrition', 'sleep'],
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },
    fileUrl: String,
    thumbnailUrl: String,
    duration: Number, // in seconds for audio/video
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    analytics: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 }
    },
    tags: [String]
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
