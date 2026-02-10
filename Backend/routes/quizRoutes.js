const express = require('express');
const {
    getQuizzes,
    getQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getStudentAttempts
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateQuizCreation } = require('../middleware/validationMiddleware');

const router = express.Router();

// Temporarily disable authentication for testing
// router.use(protect);

// Public routes for authenticated users
router.route('/')
    .get(getQuizzes);

router.route('/:id')
    .get(getQuiz);

// Teacher only routes
router.route('/')
    .post(authorize('teacher'), validateQuizCreation, createQuiz);

router.route('/:id')
    .put(authorize('teacher'), updateQuiz)
    .delete(authorize('teacher', 'admin'), deleteQuiz);

// Student quiz attempt routes
router.route('/:id/attempt')
    .post(authorize('student'), submitQuizAttempt);

router.route('/attempts')
    .get(authorize('student'), getStudentAttempts);

module.exports = router;