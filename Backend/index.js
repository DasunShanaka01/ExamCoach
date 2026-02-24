
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/study-plan', require('./routes/studyPlanRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));

app.use('/api/streams', require('./routes/streamRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));

// AI Routes
app.use('/api/ai', require('./routes/aiRoutes'));

// Error handler to return JSON (e.g., multer/cloudinary errors)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('Unhandled error', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
