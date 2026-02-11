const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Generated Quiz'
    },
    difficulty: {
        type: String,
        required: true
    },
    sourceContent: {
        type: String,
        required: false
    },
    pdfUrl: {
        type: String, // URL to the stored PDF file
        required: false
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswer: { type: String, required: true },
        explanation: { type: String },
        userAnswer: { type: String }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quiz', QuizSchema);
