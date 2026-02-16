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
import UploadKuppi from './pages/UploadKuppi';
import CreateQuiz from './pages/CreateQuiz';
import ViewQuizzes from './pages/ViewQuizzes';
import ViewKuppis from './pages/ViewKuppis';
import WatchKuppi from './pages/WatchKuppi';
import TakeQuiz from './pages/TakeQuiz';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterStudent />} />

        {/* Protected Student Routes */}
        <Route path="/student/home" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentHome />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </ProtectedRoute>
        } />
        <Route path="/student/watch-kuppi/:id" element={
          <ProtectedRoute allowedRoles={['student']}>
            <WatchKuppi />
          </ProtectedRoute>
        } />
        <Route path="/student/take-quiz/:id" element={
          <ProtectedRoute allowedRoles={['student']}>
            <TakeQuiz />
          </ProtectedRoute>
        } />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
        <Route path="/teacher/upload-kuppi" element={<UploadKuppi />} />
        <Route path="/teacher/create-quiz" element={<CreateQuiz />} />
        <Route path="/teacher/view-quizzes" element={<ViewQuizzes />} />
        <Route path="/teacher/view-kuppis" element={<ViewKuppis />} />

        {/* Admin Routes */}
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
