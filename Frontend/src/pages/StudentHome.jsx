import { useNavigate } from 'react-router-dom';

const StudentHome = () => {
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
                <h1>Welcome, {user?.name}</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </header>
            <main className="dashboard-content">
                <div className="card">
                    <h2>My Profile</h2>
                    <p>Manage your profile details here.</p>
                    {/* Link to profile edit page can go here */}
                </div>
                <div className="card">
                    <h2>My Courses</h2>
                    <p>View your enrolled courses.</p>
                </div>
            </main>
        </div>
    );
};

export default StudentHome;
