const express = require('express');
const { getAllStudents, getStudent, deleteStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getAllStudents);

router.route('/:id')
    .get(getStudent)
    .delete(deleteStudent);

module.exports = router;
