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

        // Strip sensitive fields for students, but keep for teachers editing
        const quizObj = quiz.toObject();
        if (req.query.includeCredentials !== 'true') {
            const hasCredentials = !!(quizObj.enrollmentKey || quizObj.quizPassword);
            delete quizObj.enrollmentKey;
            delete quizObj.quizPassword;
            quizObj.hasCredentials = hasCredentials;
        }

        res.status(200).json({ success: true, data: quizObj });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify quiz access (enrollment key + password)
// @route   POST /api/quizzes/:id/verify
// @access  Private/Student
exports.verifyQuizAccess = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ 
                success: false, 
                error: 'Quiz not found' 
            });
        }

        const { enrollmentKey, quizPassword } = req.body;

        // If quiz has no enrollment key/password set, allow access
        if (!quiz.enrollmentKey && !quiz.quizPassword) {
            return res.status(200).json({ success: true, message: 'Access granted' });
        }

        // Check enrollment time window
        if (quiz.enrollmentStartTime && quiz.enrollmentEndTime) {
            const now = new Date();
            if (now < new Date(quiz.enrollmentStartTime) || now > new Date(quiz.enrollmentEndTime)) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Enrollment period is closed for this quiz' 
                });
            }
        }

        // Verify enrollment key
        if (quiz.enrollmentKey && quiz.enrollmentKey !== enrollmentKey) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid enrollment key' 
            });
        }

        // Verify quiz password
        if (quiz.quizPassword && quiz.quizPassword !== quizPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid quiz password' 
            });
        }

        res.status(200).json({ success: true, message: 'Access granted' });
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

        // Require authenticated user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized. Please log in.' 
            });
        }

        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student profile not found. Please complete your profile first.' 
            });
        }
        const studentId = student._id;

        // Check max attempts
        if (quiz.maxAttempts && quiz.maxAttempts > 0) {
            const existingAttempts = await QuizAttempt.countDocuments({ student: studentId, quiz: quiz._id });
            if (existingAttempts >= quiz.maxAttempts) {
                return res.status(403).json({
                    success: false,
                    error: `You have used all ${quiz.maxAttempts} attempt(s) for this quiz.`
                });
            }
        }

        const { answers, timeTaken, tabSwitchCount } = req.body;

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
            timeTaken,
            tabSwitchCount: tabSwitchCount || 0
        });

        // Check if all attempts used after this submission
        const totalAttemptsMade = await QuizAttempt.countDocuments({ student: studentId, quiz: quiz._id });
        const allAttemptsUsed = quiz.maxAttempts > 0 && totalAttemptsMade >= quiz.maxAttempts;

        // If all attempts used, include questions with explanations and correct answers
        const responseData = {
            attempt,
            results: {
                score,
                totalQuestions: quiz.questions.length,
                percentage,
                attemptsMade: totalAttemptsMade,
                maxAttempts: quiz.maxAttempts || 1,
                allAttemptsUsed
            }
        };

        if (allAttemptsUsed) {
            responseData.results.questions = quiz.questions.map((q, i) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                studentAnswer: processedAnswers[i]?.selectedAnswer,
                isCorrect: processedAnswers[i]?.isCorrect
            }));
        }

        res.status(201).json({ 
            success: true, 
            data: responseData
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all attempts for a specific quiz (teacher view)
// @route   GET /api/quizzes/:id/attempts
// @access  Private/Teacher
exports.getQuizAttempts = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const attempts = await QuizAttempt.find({ quiz: req.params.id })
            .populate({
                path: 'student',
                select: 'firstName lastName profilePic',
            })
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

// @desc    Get student's quiz attempts
// @route   GET /api/quizzes/attempts
// @access  Private/Student
exports.getStudentAttempts = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized. Please log in.' 
            });
        }

        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(200).json({ 
                success: true, 
                count: 0, 
                data: [] 
            });
        }
        
        const attempts = await QuizAttempt.find({ student: student._id })
            .populate('quiz', 'title subject maxAttempts')
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

// @desc    Get student's attempts for a specific quiz
// @route   GET /api/quizzes/:id/my-attempts
// @access  Private/Student
exports.getMyAttemptsForQuiz = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized.' });
        }

        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(200).json({ success: true, count: 0, data: [], maxAttempts: 1 });
        }

        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        const attempts = await QuizAttempt.find({ student: student._id, quiz: quiz._id })
            .sort({ completedAt: -1 });

        const allUsed = quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts;

        res.status(200).json({ 
            success: true, 
            count: attempts.length,
            maxAttempts: quiz.maxAttempts || 1,
            allAttemptsUsed: allUsed,
            data: attempts
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};