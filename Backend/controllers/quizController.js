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

        // Temporarily handle unauthenticated requests for testing
        if (req.user && req.user.id) {
            const teacher = await Teacher.findOne({ user: req.user.id });
            if (quiz.createdBy.toString() !== teacher._id.toString()) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Not authorized to update this quiz' 
                });
            }
        }
        // For testing without auth, allow updates

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

        // Temporarily handle unauthenticated requests for testing
        if (req.user && req.user.id) {
            const teacher = await Teacher.findOne({ user: req.user.id });
            if (req.user.role !== 'admin' && 
                quiz.createdBy.toString() !== teacher._id.toString()) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Not authorized to delete this quiz' 
                });
            }
        }
        // For testing without auth, allow deletion

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

        // Temporarily handle unauthenticated requests for testing
        let studentId = null;
        if (req.user && req.user.id) {
            const student = await Student.findOne({ user: req.user.id });
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Student profile not found' 
                });
            }
            studentId = student._id;
        } else {
            // For testing without auth, create or find a test student
            let testStudent = await Student.findOne({ email: 'test@student.com' });
            if (!testStudent) {
                testStudent = await Student.create({
                    name: 'Test Student',
                    email: 'test@student.com',
                    grade: 'Test'
                });
            }
            studentId = testStudent._id;
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
            student: studentId,
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
        // Temporarily handle unauthenticated requests for testing
        let studentId = null;
        if (req.user && req.user.id) {
            const student = await Student.findOne({ user: req.user.id });
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Student profile not found' 
                });
            }
            studentId = student._id;
        } else {
            // For testing without auth, use test student
            const testStudent = await Student.findOne({ email: 'test@student.com' });
            if (testStudent) {
                studentId = testStudent._id;
            }
        }

        if (!studentId) {
            return res.status(200).json({ 
                success: true, 
                count: 0, 
                data: [] 
            });
        }
        
        const attempts = await QuizAttempt.find({ student: studentId })
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