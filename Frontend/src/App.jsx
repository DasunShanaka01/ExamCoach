
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import StudentHome from './pages/StudentHome';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherList from './pages/TeacherList';
import AddTeacher from './pages/AddTeacher';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterStudent />} />

        {/* Protected Routes (Ideally wrapped in a ProtectedRoute component) */}
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Admin Management Routes */}
        <Route path="/admin/teachers" element={<TeacherList />} />
        <Route path="/admin/add-teacher" element={<AddTeacher />} />
      </Routes>
    </div>
  );
};

export default App;
