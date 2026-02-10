const express = require('express');
const router = express.Router();
const {
    createStudyPlan,
    getStudyPlan,
    deleteStudyPlan
} = require('../controllers/studyPlanController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('student'), createStudyPlan)
    .get(protect, authorize('student'), getStudyPlan)
    .delete(protect, authorize('student'), deleteStudyPlan);

module.exports = router;
