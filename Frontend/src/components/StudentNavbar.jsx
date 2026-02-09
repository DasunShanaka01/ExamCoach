
import { Link, useNavigate } from 'react-router-dom';

const StudentNavbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="student-navbar">
            <div className="navbar-brand">
                <Link to="/student/home">ExamCoach</Link>
            </div>
            <div className="navbar-links">
                <Link to="/student/home">Home</Link>
                <Link to="/student/courses">My Courses</Link>
                <Link to="/student/profile">Profile</Link>
            </div>
            <div className="navbar-user">
                <span>{user?.name}</span>
                <button onClick={handleLogout} className="btn-logout-small">Logout</button>
            </div>
        </nav>
    );
};

export default StudentNavbar;
