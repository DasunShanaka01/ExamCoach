import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';

const StudentHome = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <div className="page-container">
            <StudentNavbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Welcome, {user?.name}</h1>
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
        </div>
    );
};

export default StudentHome;
