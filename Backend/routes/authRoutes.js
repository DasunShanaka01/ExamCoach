const express = require('express');
const { registerStudent, login, addTeacher, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

const router = express.Router();

router.post('/register-student', upload.single('profilePic'), registerStudent);
router.post('/login', login);
router.post('/add-teacher', protect, authorize('admin'), upload.single('profilePic'), addTeacher);
router.get('/me', protect, getMe);

module.exports = router;
