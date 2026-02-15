
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import StudentHome from './pages/StudentHome';
import StudentProfile from './pages/StudentProfile';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherProfile from './pages/TeacherProfile';
import AdminDashboard from './pages/AdminDashboard';
import TeacherList from './pages/TeacherList';
import AddTeacher from './pages/AddTeacher';
import StudentList from './pages/StudentList';
import AILearningLabPage from './pages/AILearningLabPage';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterStudent />} />

        {/* Protected Routes (Ideally wrapped in a ProtectedRoute component) */}
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/ai_learning_lab" element={<AILearningLabPage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Admin Management Routes */}
        <Route path="/admin/teachers" element={<TeacherList />} />
        <Route path="/admin/add-teacher" element={<AddTeacher />} />
        <Route path="/admin/students" element={<StudentList />} />
      </Routes>
    </div>
  );
};

export default App;
