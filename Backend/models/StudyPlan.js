const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    studyHoursPerDay: {
        type: Number,
        required: true
    },
    subjects: {
        type: [String],
        required: true
    },
    weakSubjects: {
        type: [String],
        default: []
    },
    generatedPlan: [{
        subject: {
            type: String,
            required: true
        },
        allocatedMinutes: {
            type: Number,
            required: true
        }
    }],
    daysUntilExam: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
