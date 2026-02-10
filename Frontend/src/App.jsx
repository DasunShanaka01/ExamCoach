
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import StudentHome from './pages/StudentHome';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherList from './pages/TeacherList';
import AddTeacher from './pages/AddTeacher';
import StudentList from './pages/StudentList';
import AdminCoursePortal from './pages/AdminCoursePortal';
import CourseExplorer from './pages/CourseExplorer';
import TeacherMaterials from './pages/TeacherMaterials';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterStudent />} />

        {/* Protected Routes (Ideally wrapped in a ProtectedRoute component) */}
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/student/courses" element={<CourseExplorer />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/materials" element={<TeacherMaterials />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<AdminCoursePortal />} />

        {/* Admin Management Routes */}
        <Route path="/admin/teachers" element={<TeacherList />} />
        <Route path="/admin/add-teacher" element={<AddTeacher />} />
        <Route path="/admin/students" element={<StudentList />} />
      </Routes>
    </div>
  );
};

export default App;
