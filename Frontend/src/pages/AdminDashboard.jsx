
import { useNavigate, Link } from 'react-router-dom';

const AdminDashboard = () => {
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
                <h1>Admin Dashboard</h1>
                <div className="user-info">
                    <span>{user?.name}</span>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </header>
            <main className="dashboard-content">
                <div className="grid-container">
                    <div className="card">
                        <h3>Manage Teachers</h3>
                        <p>Add, view, update, and delete teachers.</p>
                        <Link to="/admin/teachers" className="btn-link">Go to Teachers</Link>
                    </div>
                    <div className="card">
                        <h3>Manage Students</h3>
                        <p>View and manage all students.</p>
                        {/* Link to student management */}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
