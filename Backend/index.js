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
app.use(express.json());
app.use(cors());

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

// Kuppi Routes
const kuppiRoutes = require('./routes/kuppiRoutes');
const quizRoutes = require('./routes/quizRoutes');

app.use('/api/kuppi', kuppiRoutes);
app.use('/api/quizzes', quizRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
