import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TeacherDashboard = () => {
    return (
        <div className="layout-container">
            <Sidebar role="teacher" />
            <div className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <h1>Teacher Dashboard</h1>
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
            </div>
        </div>
    );
};

export default TeacherDashboard;
