const express = require('express');
const {
    getTeachers,
    getTeacher,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and restricted to Admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getTeachers);

router.route('/:id')
    .get(getTeacher)
    .put(updateTeacher)
    .delete(deleteTeacher);

module.exports = router;
