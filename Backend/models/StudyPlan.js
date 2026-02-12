const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studyHoursPerDay: {
        type: Number,
        required: true
    },
    subjects: [{
        name: {
            type: String,
            required: true
        },
        examDate: {
            type: Date,
            required: true
        },
        isWeak: {
            type: Boolean,
            default: false
        }
    }],
    generatedPlan: [{
        subject: {
            type: String,
            required: true
        },
        examDate: {
            type: Date,
            required: true
        },
        allocatedMinutes: {
            type: Number,
            required: true
        },
        tasks: [{
            text: {
                type: String,
                required: true
            },
            isCompleted: {
                type: Boolean,
                default: false
            }
        }]
    }],
    // We can keep this to show the *soonest* exam or remove it. 
    // Let's keep it as "daysUntilNextExam" for dashboard widgets.
    daysUntilNextExam: {
        type: Number
    },
    // Daily study logs to track actual study time
    dailyLogs: [{
        date: {
            type: Date,
            required: true
        },
        hoursStudied: {
            type: Number,
            required: true,
            default: 0
        },
        minutesStudied: {
            type: Number,
            required: true,
            default: 0
        },
        totalMinutes: {
            type: Number,
            required: true
        },
        goalMet: {
            type: Boolean,
            default: false
        }
    }],
    // Pending suggestion to add missed time to next day
    pendingMissedTime: {
        hours: {
            type: Number,
            default: 0
        },
        minutes: {
            type: Number,
            default: 0
        },
        fromDate: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
