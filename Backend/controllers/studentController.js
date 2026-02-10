const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('user', 'name email');
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'name email');

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get student profile by user ID
// @route   GET /api/students/profile/:userId
// @access  Private (Student themselves)
exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.params.userId }).populate('user', 'name email');

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student profile not found' });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update student profile
// @route   PUT /api/students/profile/:userId
// @access  Private (Student themselves)
exports.updateStudentProfile = async (req, res) => {
    try {
        const { name, firstName, lastName, dob, gender, phone, address, profilePic } = req.body;

        // Find student by user ID
        const student = await Student.findOne({ user: req.params.userId });

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student profile not found' });
        }

        // Update User name if provided
        if (name) {
            await User.findByIdAndUpdate(req.params.userId, { name });
        }

        // Update Student fields
        if (firstName) student.firstName = firstName;
        if (lastName) student.lastName = lastName;
        if (dob) student.dob = dob;
        if (gender) student.gender = gender;
        if (phone) student.phone = phone;
        if (address) student.address = address;
        if (profilePic) student.profilePic = profilePic;

        await student.save();

        const updatedStudent = await Student.findById(student._id).populate('user', 'name email');

        res.status(200).json({
            success: true,
            data: updatedStudent
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Delete associated User
        await User.findByIdAndDelete(student.user);

        // Delete Student profile
        await student.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
