
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>ExamCoach</h3>
                <p>{role === 'admin' ? 'Admin Portal' : 'Teacher Portal'}</p>
            </div>

            <div className="sidebar-menu">
                {role === 'admin' && (
                    <>
                        <Link to="/admin/dashboard" className={`sidebar-item ${isActive('/admin/dashboard')}`}>
                            Dashboard
                        </Link>
                        <Link to="/admin/teachers" className={`sidebar-item ${isActive('/admin/teachers') || isActive('/admin/add-teacher')}`}>
                            Manage Teachers
                        </Link>
                        <Link to="/admin/students" className={`sidebar-item ${isActive('/admin/students')}`}>
                            Manage Students
                        </Link>
                    </>
                )}

                {role === 'teacher' && (
                    <>
                        <Link to="/teacher/dashboard" className={`sidebar-item ${isActive('/teacher/dashboard')}`}>
                            Dashboard
                        </Link>
                        <Link to="/teacher/classes" className={`sidebar-item ${isActive('/teacher/classes')}`}>
                            My Classes
                        </Link>
                        <Link to="/teacher/assignments" className={`sidebar-item ${isActive('/teacher/assignments')}`}>
                            Assignments
                        </Link>
                        <Link to="/teacher/profile" className={`sidebar-item ${isActive('/teacher/profile')}`}>
                            My Profile
                        </Link>
                    </>
                )}
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{role}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="btn-logout-full">Logout</button>
            </div>
        </div>
    );
};

export default Sidebar;
