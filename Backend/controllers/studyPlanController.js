const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

// @desc    Create a new study plan
// @route   POST /api/study-plan
// @access  Private (Student)
// @desc    Create a new study plan
// @route   POST /api/study-plan
// @access  Private (Student)
const createStudyPlan = async (req, res) => {
    try {
        const { studyHoursPerDay, subjects } = req.body;
        // subjects is now an array of { name, examDate, isWeak }

        if (!subjects || subjects.length === 0) {
            return res.status(400).json({ success: false, error: 'Please add at least one subject' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today

        // 1. Calculate Urgency Scores
        let totalScore = 0;
        const subjectCalculations = subjects.map(sub => {
            const exam = new Date(sub.examDate);
            exam.setHours(0, 0, 0, 0);

            let daysLeft = Math.ceil((exam - today) / (1000 * 3600 * 24));
            if (daysLeft < 0) daysLeft = 0; // Overdue
            if (daysLeft === 0) daysLeft = 0.5; // Exam is today/tomorrow morning, maximum urgency

            // Urgency Formula: Inverse of days left. 
            // Add 1 to denominator to avoid division by zero and smooth curve.
            let urgency = 10 / (daysLeft + 1);

            // Weight Multiplier
            if (sub.isWeak) {
                urgency *= 1.5; // 50% more attention for weak subjects
            }

            return {
                ...sub,
                daysLeft,
                score: urgency
            };
        });

        // Sum total scores for normalization
        totalScore = subjectCalculations.reduce((acc, curr) => acc + curr.score, 0);

        // Fetch existing plan to preserve tasks
        const existingPlan = await StudyPlan.findOne({ user: req.user.id });
        const existingTasks = {};
        if (existingPlan && existingPlan.generatedPlan) {
            existingPlan.generatedPlan.forEach(item => {
                if (item.tasks && item.tasks.length > 0) {
                    existingTasks[item.subject] = item.tasks;
                }
            });
        }

        // 2. Generate Plan
        const generatedPlan = subjectCalculations.map(sub => {
            const ratio = totalScore > 0 ? sub.score / totalScore : 0;
            const minutes = Math.round(studyHoursPerDay * 60 * ratio);

            return {
                subject: sub.name,
                examDate: sub.examDate,
                allocatedMinutes: minutes,
                isWeak: sub.isWeak,
                daysLeft: sub.daysLeft,
                tasks: existingTasks[sub.name] || [] // Preserve tasks or empty array
            };
        });

        // Sort by Exam Date (Soonest first)
        generatedPlan.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

        // Calculate days until NEXT exam
        const nextExamDays = generatedPlan.length > 0 ? Math.min(...generatedPlan.map(p => p.daysLeft)) : 0;

        // 3. Save to database
        // Delete existing plan to avoid schema conflicts/duplication
        if (existingPlan) {
            await StudyPlan.findOneAndDelete({ user: req.user.id });
        }

        const plan = await StudyPlan.create({
            user: req.user.id,
            studyHoursPerDay,
            subjects,
            generatedPlan,
            daysUntilNextExam: nextExamDays
        });

        res.status(201).json({
            success: true,
            data: plan
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get current user's study plan
// @route   GET /api/study-plan
// @access  Private (Student)
const getStudyPlan = async (req, res) => {
    try {
        const plan = await StudyPlan.findOne({ user: req.user.id });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'No study plan found' });
        }

        // Recalculate days left on read (simple update)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find next exam days
        const daysUntilNext = plan.subjects.reduce((min, sub) => {
            const exam = new Date(sub.examDate);
            const diff = Math.ceil((exam - today) / (1000 * 3600 * 24));
            return (diff >= 0 && diff < min) ? diff : min;
        }, 9999);

        if (plan.daysUntilNextExam !== daysUntilNext && daysUntilNext !== 9999) {
            plan.daysUntilNextExam = daysUntilNext;
            await plan.save();
        }

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add a task to a subject
// @route   POST /api/study-plan/task
// @access  Private (Student)
const addTask = async (req, res) => {
    try {
        const { subjectName, taskText } = req.body;
        const plan = await StudyPlan.findOne({ user: req.user.id });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Study plan not found' });
        }

        const subjectEntry = plan.generatedPlan.find(item => item.subject === subjectName);
        if (!subjectEntry) {
            return res.status(404).json({ success: false, error: 'Subject not found in plan' });
        }

        subjectEntry.tasks.push({ text: taskText, isCompleted: false });
        await plan.save();

        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Toggle task completion status
// @route   PATCH /api/study-plan/task/:taskId
// @access  Private (Student)
const toggleTask = async (req, res) => {
    try {
        const plan = await StudyPlan.findOne({ user: req.user.id });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'Study plan not found' });
        }

        // Find the task across all subjects
        let taskFound = false;
        for (const subject of plan.generatedPlan) {
            const task = subject.tasks.id(req.params.taskId);
            if (task) {
                task.isCompleted = !task.isCompleted;
                taskFound = true;
                break;
            }
        }

        if (!taskFound) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        await plan.save();
        res.status(200).json({ success: true, data: plan });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete study plan
// @route   DELETE /api/study-plan
// @access  Private (Student)
const deleteStudyPlan = async (req, res) => {
    try {
        const plan = await StudyPlan.findOneAndDelete({ user: req.user.id });

        if (!plan) {
            return res.status(404).json({ success: false, error: 'No study plan found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Log study time for today
// @route   POST /api/study-plan/log-time
// @access  Private (Student)
const logStudyTime = async (req, res) => {
    try {
        const { hours, minutes } = req.body;

        if (hours === undefined || minutes === undefined) {
            return res.status(400).json({ success: false, error: 'Please provide hours and minutes' });
        }

        const plan = await StudyPlan.findOne({ user: req.user.id });
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Study plan not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate total minutes
        const totalMinutes = (parseInt(hours) * 60) + parseInt(minutes);
        const dailyGoalMinutes = plan.studyHoursPerDay * 60;

        // Check if there's a pending missed time to add
        let adjustedGoalMinutes = dailyGoalMinutes;
        if (plan.pendingMissedTime && plan.pendingMissedTime.isActive) {
            const pendingMinutes = (plan.pendingMissedTime.hours * 60) + plan.pendingMissedTime.minutes;
            adjustedGoalMinutes += pendingMinutes;
        }

        const goalMet = totalMinutes >= adjustedGoalMinutes;

        // Check if log for today already exists
        const existingLogIndex = plan.dailyLogs.findIndex(log => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
        });

        if (existingLogIndex !== -1) {
            // Update existing log
            plan.dailyLogs[existingLogIndex] = {
                date: today,
                hoursStudied: parseInt(hours),
                minutesStudied: parseInt(minutes),
                totalMinutes,
                goalMet
            };
        } else {
            // Add new log
            plan.dailyLogs.push({
                date: today,
                hoursStudied: parseInt(hours),
                minutesStudied: parseInt(minutes),
                totalMinutes,
                goalMet
            });
        }

        // If goal not met, calculate missed time for suggestion
        if (!goalMet) {
            const missedMinutes = adjustedGoalMinutes - totalMinutes;
            const missedHours = Math.floor(missedMinutes / 60);
            const missedMins = missedMinutes % 60;

            plan.pendingMissedTime = {
                hours: missedHours,
                minutes: missedMins,
                fromDate: today,
                isActive: true
            };
        } else {
            // Goal met, clear pending missed time
            plan.pendingMissedTime = {
                hours: 0,
                minutes: 0,
                fromDate: null,
                isActive: false
            };
        }

        await plan.save();

        res.status(200).json({
            success: true,
            data: {
                plan,
                goalMet,
                totalMinutes,
                goalMinutes: adjustedGoalMinutes
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get today's study progress
// @route   GET /api/study-plan/today-progress
// @access  Private (Student)
const getTodayProgress = async (req, res) => {
    try {
        const plan = await StudyPlan.findOne({ user: req.user.id });
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Study plan not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's log
        const todayLog = plan.dailyLogs.find(log => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
        });

        const dailyGoalMinutes = plan.studyHoursPerDay * 60;
        let adjustedGoalMinutes = dailyGoalMinutes;

        // Add pending missed time if active
        if (plan.pendingMissedTime && plan.pendingMissedTime.isActive) {
            const pendingMinutes = (plan.pendingMissedTime.hours * 60) + plan.pendingMissedTime.minutes;
            adjustedGoalMinutes += pendingMinutes;
        }

        res.status(200).json({
            success: true,
            data: {
                todayLog: todayLog || null,
                dailyGoalMinutes,
                adjustedGoalMinutes,
                pendingMissedTime: plan.pendingMissedTime
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Handle missed goal suggestion response (accept/decline)
// @route   POST /api/study-plan/missed-goal-response
// @access  Private (Student)
const handleMissedGoalResponse = async (req, res) => {
    try {
        const { accept } = req.body;

        const plan = await StudyPlan.findOne({ user: req.user.id });
        if (!plan) {
            return res.status(404).json({ success: false, error: 'Study plan not found' });
        }

        if (!plan.pendingMissedTime || !plan.pendingMissedTime.isActive) {
            return res.status(400).json({ success: false, error: 'No pending missed time suggestion' });
        }

        if (accept) {
            // Keep the pending missed time active (it will be added to today's goal)
            // It's already set, so we just acknowledge it
            res.status(200).json({
                success: true,
                message: 'Missed time will be added to your next study session',
                data: plan
            });
        } else {
            // Clear the pending missed time
            plan.pendingMissedTime = {
                hours: 0,
                minutes: 0,
                fromDate: null,
                isActive: false
            };
            await plan.save();

            res.status(200).json({
                success: true,
                message: 'Missed time suggestion declined',
                data: plan
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

module.exports = {
    createStudyPlan,
    getStudyPlan,
    deleteStudyPlan,
    addTask,
    toggleTask,
    logStudyTime,
    getTodayProgress,
    handleMissedGoalResponse
};
