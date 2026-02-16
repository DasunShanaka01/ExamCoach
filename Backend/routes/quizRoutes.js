const express = require('express');
const {
    getQuizzes,
    getQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getStudentAttempts,
    verifyQuizAccess,
    getQuizAttempts,
    getMyAttemptsForQuiz
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateQuizCreation } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public quiz listing
router.route('/')
    .get(getQuizzes)
    .post(validateQuizCreation, createQuiz);

// Student attempts (must be before /:id routes)
router.route('/attempts')
    .get(protect, getStudentAttempts);

router.route('/:id')
    .get(getQuiz)
    .put(updateQuiz)
    .delete(deleteQuiz);

router.route('/:id/verify')
    .post(protect, verifyQuizAccess);

router.route('/:id/attempt')
    .post(protect, submitQuizAttempt);

router.route('/:id/attempts')
    .get(getQuizAttempts);

router.route('/:id/my-attempts')
    .get(protect, getMyAttemptsForQuiz);

module.exports = router;