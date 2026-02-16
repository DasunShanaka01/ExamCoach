const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
        methods: ['GET', 'POST']
    }
});

// Make io accessible to routes if needed
app.set('io', io);

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

// ========== Socket.io — Cheating Detection ==========
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Student or teacher joins a quiz room
    socket.on('join-quiz', (data) => {
        const { quizId, role, studentName } = data;
        const room = `quiz-${quizId}`;
        socket.join(room);
        socket.quizRoom = room;
        socket.userRole = role;
        socket.studentName = studentName;
        console.log(`${role} "${studentName || 'teacher'}" joined room: ${room}`);
    });

    // Teacher joins monitoring room to receive alerts from all quizzes
    socket.on('join-teacher-monitor', (data) => {
        socket.join('teacher-monitor');
        socket.userRole = 'teacher';
        console.log('Teacher joined global monitor room:', socket.id);
    });

    // Student switched tab — relay to all teachers in the quiz room + global monitor
    socket.on('tab-switch', (data) => {
        console.log(`⚠️  Tab switch detected — Student: ${data.studentName}, Quiz: ${data.quizTitle}, Count: ${data.switchCount}`);

        const room = `quiz-${data.quizId}`;
        // Broadcast to teachers in specific quiz room
        socket.to(room).emit('student-tab-switch', data);
        // Broadcast to all teachers in global monitor room
        socket.to('teacher-monitor').emit('student-tab-switch', data);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
