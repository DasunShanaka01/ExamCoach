const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isActive: true })
            .populate('createdBy', 'name subject')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true, 
            count: quizzes.length, 
            data: quizzes 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'name subject');

        if (!quiz) {
            return res.status(404).json({ 
                success: false, 
                error: 'Quiz not found' 
            });
        }

        res.status(200).json({ success: true, data: quiz });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private/Teacher
exports.createQuiz = async (req, res) => {
    try {
        // Temporarily disable teacher check for testing
        // const teacher = await Teacher.findOne({ user: req.user.id });

        // if (!teacher) {
        //     return res.status(404).json({
        //         success: false,
        //         error: 'Teacher profile not found'
        //     });
        // }

        const quizData = {
            ...req.body,
            createdBy: null // Temporarily set to null for testing
        };

        const quiz = await Quiz.create(quizData);

        res.status(201).json({ success: true, data: quiz });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Teacher (own quiz only)
exports.updateQuiz = async (req, res) => {
    try {
        let quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ 
                success: false, 
                error: 'Quiz not found' 
            });
        }

        const teacher = await Teacher.findOne({ user: req.user.id });
        if (quiz.createdBy.toString() !== teacher._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                error: 'Not authorized to update this quiz' 
            });
        }

        const updateData = { ...req.body };
        if (req.body.questions) {
            updateData.totalQuestions = req.body.questions.length;
        }

        quiz = await Quiz.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: quiz });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Teacher (own quiz only) or Admin
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ 
                success: false, 
                error: 'Quiz not found' 
            });
        }

        const teacher = await Teacher.findOne({ user: req.user.id });
        if (req.user.role !== 'admin' && 
            quiz.createdBy.toString() !== teacher._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                error: 'Not authorized to delete this quiz' 
            });
        }

        await quiz.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private/Student
exports.submitQuizAttempt = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({ 
                success: false, 
                error: 'Quiz not found' 
            });
        }

        const student = await Student.findOne({ user: req.user.id });
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student profile not found' 
            });
        }

        const { answers, timeTaken } = req.body;

        // Calculate score
        let correctAnswers = 0;
        const processedAnswers = answers.map((answer, index) => {
            const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
            if (isCorrect) correctAnswers++;
            return {
                questionIndex: index,
                selectedAnswer: answer.selectedAnswer,
                isCorrect
            };
        });

        const score = correctAnswers;
        const percentage = (correctAnswers / quiz.questions.length) * 100;

        const attempt = await QuizAttempt.create({
            student: student._id,
            quiz: quiz._id,
            answers: processedAnswers,
            score,
            totalQuestions: quiz.questions.length,
            percentage,
            timeTaken
        });

        res.status(201).json({ 
            success: true, 
            data: {
                attempt,
                results: {
                    score,
                    totalQuestions: quiz.questions.length,
                    percentage
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get student's quiz attempts
// @route   GET /api/quizzes/attempts
// @access  Private/Student
exports.getStudentAttempts = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        
        const attempts = await QuizAttempt.find({ student: student._id })
            .populate('quiz', 'title subject')
            .sort({ completedAt: -1 });

        res.status(200).json({ 
            success: true, 
            count: attempts.length, 
            data: attempts 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};