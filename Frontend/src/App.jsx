import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterStudent from './pages/RegisterStudent';
import StudentHome from './pages/StudentHome';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherList from './pages/TeacherList';
import AddTeacher from './pages/AddTeacher';
import StudentList from './pages/StudentList';
import UploadKuppi from './pages/UploadKuppi';
import CreateQuiz from './pages/CreateQuiz';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterStudent />} />

        {/* Protected Routes */}
        <Route path="/student/home" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentHome />
          </ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        {/* Teacher Routes - Temporarily unprotected for testing */}
        <Route path="/teacher/upload-kuppi" element={<UploadKuppi />} />
        <Route path="/teacher/create-quiz" element={<CreateQuiz />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Management Routes */}
        <Route path="/admin/teachers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TeacherList />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-teacher" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AddTeacher />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StudentList />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;
