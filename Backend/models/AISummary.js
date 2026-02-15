const mongoose = require('mongoose');

const AISummarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Assuming 'Student' is the user model, adjustable if generic 'User'
        required: true
    },
    title: {
        type: String,
        required: true
    },
    originalContent: {
        type: String, // Can be text content or Cloudinary URL
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'pdf'],
        default: 'text'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AISummary', AISummarySchema);
