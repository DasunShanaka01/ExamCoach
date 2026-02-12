const express = require('express');
const router = express.Router();
const {
    createStudyPlan,
    getStudyPlan,
    deleteStudyPlan,
    addTask,
    toggleTask,
    logStudyTime,
    getTodayProgress,
    handleMissedGoalResponse
} = require('../controllers/studyPlanController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('student'), createStudyPlan)
    .get(protect, authorize('student'), getStudyPlan)
    .delete(protect, authorize('student'), deleteStudyPlan);

router.post('/task', protect, authorize('student'), addTask);
router.patch('/task/:taskId', protect, authorize('student'), toggleTask);

router.post('/log-time', protect, authorize('student'), logStudyTime);
router.get('/today-progress', protect, authorize('student'), getTodayProgress);
router.post('/missed-goal-response', protect, authorize('student'), handleMissedGoalResponse);

module.exports = router;
