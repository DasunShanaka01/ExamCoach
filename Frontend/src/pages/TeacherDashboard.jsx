import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Teacher Dashboard</h1>
                <div className="user-info">
                    <span>{user?.name}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>
            <main className="dashboard-content">
                <div className="grid-container">
                    <div className="card">
                        <h3>My Classes</h3>
                        <p>Manage your classes and students.</p>
                    </div>
                    <div className="card">
                        <h3>Assignments</h3>
                        <p>Create and grade assignments.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
