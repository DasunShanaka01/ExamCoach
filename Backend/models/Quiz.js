const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number, // index of correct option
        required: true
    },
    explanation: {
        type: String
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    timeLimit: {
        type: Number, // in minutes
        default: 30
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalQuestions: {
        type: Number,
        default: function() {
            return this.questions.length;
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);