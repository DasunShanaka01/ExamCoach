const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

// ── Token Helper ─────────────────────────────────────────────
// Signs a JWT containing the user's id and role.
// Expiry is controlled by JWT_EXPIRES_IN in .env (default: 30d).
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
};

// @desc    Register a student
// @route   POST /api/auth/register-student
// @access  Public
exports.registerStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        let profilePic = 'default-profile.png';

        // If a profile picture was uploaded (via Cloudinary/multer), use its URL
        if (req.file) {
            profilePic = req.file.path;
        }

        // VALIDATION: Prevent duplicate accounts — email must be unique in the User collection
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Create base User record (holds credentials and role)
        const user = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password,
            role: 'student'
        });

        // Create linked Student profile (holds personal details)
        const student = await Student.create({
            user: user._id,
            firstName,
            lastName,
            profilePic
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: student
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // VALIDATION: Both email and password must be provided
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // VALIDATION: User must exist and password must match the stored bcrypt hash
        // .select('+password') is needed because password is excluded by default in the schema
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);

        // Fetch role-specific profile data to return alongside the token
        let profile = null;
        if (user.role === 'student') {
            profile = await Student.findOne({ user: user._id });
        } else if (user.role === 'teacher') {
            profile = await Teacher.findOne({ user: user._id });
        }
        // Admin users have no separate profile record

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Add a teacher (Admin only)
// @route   POST /api/auth/add-teacher
// @access  Private/Admin
exports.addTeacher = async (req, res) => {
    try {
        const {
            name, email, password,
            address, contactNo, nic, experience,
            qualification, subject, gender, dob
        } = req.body;

        let profilePic = 'default-profile.png';
        if (req.file) {
            profilePic = req.file.path;
        }

        // VALIDATION: Teacher email must be unique — same check as student registration
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Create base User record with teacher role
        const user = await User.create({
            name,
            email,
            password,
            role: 'teacher'
        });

        // Create linked Teacher profile (holds professional details)
        const teacher = await Teacher.create({
            user: user._id,
            name,
            address,
            contactNo,
            nic,
            experience,
            qualification,
            subject,
            gender,
            dob,
            profilePic
        });

        res.status(201).json({
            success: true,
            message: 'Teacher added successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: teacher
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        let profile = null;
        if (user.role === 'student') {
            profile = await Student.findOne({ user: user._id });
        } else if (user.role === 'teacher') {
            profile = await Teacher.findOne({ user: user._id });
        }

        res.status(200).json({
            success: true,
            data: {
                ...user._doc,
                profile
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
