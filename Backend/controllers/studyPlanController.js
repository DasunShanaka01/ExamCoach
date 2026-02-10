const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

// @desc    Create a new study plan
// @route   POST /api/study-plan
// @access  Private (Student)
const createStudyPlan = async (req, res) => {
    try {
        const { examDate, studyHoursPerDay, subjects, weakSubjects } = req.body;

        // 1. Calculate days left
        const today = new Date();
        const exam = new Date(examDate);
        const differenceInTime = exam.getTime() - today.getTime();
        const daysLeft = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        if (daysLeft <= 0) {
            return res.status(400).json({ success: false, error: 'Exam date must be in the future' });
        }

        // 2. Logic to allocate hours
        let totalWeight = 0;
        const subjectWeights = {};
        const isWeak = (sub) => weakSubjects && weakSubjects.includes(sub);

        subjects.forEach(subject => {
            let weight = 1;
            if (isWeak(subject)) weight = 2;

            subjectWeights[subject] = weight;
            totalWeight += weight;
        });

        const generatedPlan = subjects.map(subject => {
            const weight = subjectWeights[subject];
            const ratio = totalWeight > 0 ? weight / totalWeight : 0;
            const hours = studyHoursPerDay * ratio;
            const minutes = Math.round(hours * 60);

            return {
                subject,
                allocatedMinutes: minutes
            };
        });

        // 3. Save to database
        let plan = await StudyPlan.findOne({ user: req.user.id });

        if (plan) {
            plan.examDate = examDate;
            plan.studyHoursPerDay = studyHoursPerDay;
            plan.subjects = subjects;
            plan.weakSubjects = weakSubjects || [];
            plan.generatedPlan = generatedPlan;
            plan.daysUntilExam = daysLeft; // Initial calculation
            await plan.save();
        } else {
            plan = await StudyPlan.create({
                user: req.user.id,
                examDate,
                studyHoursPerDay,
                subjects,
                weakSubjects: weakSubjects || [],
                generatedPlan,
                daysUntilExam: daysLeft
            });
        }

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

        // Helper to update days left
        const today = new Date();
        const exam = new Date(plan.examDate);
        const remainingTime = exam.getTime() - today.getTime();
        const currentDaysLeft = Math.ceil(remainingTime / (1000 * 3600 * 24));

        if (currentDaysLeft !== plan.daysUntilExam) {
            plan.daysUntilExam = currentDaysLeft;
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

module.exports = {
    createStudyPlan,
    getStudyPlan,
    deleteStudyPlan
};
