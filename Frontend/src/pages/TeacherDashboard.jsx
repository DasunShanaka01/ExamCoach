import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TeacherDashboard = () => {
    const navigate = useNavigate();

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
                            <div className="card" onClick={() => navigate('/teacher/upload-kuppi')}>
                                <h3>Upload Kuppi Session</h3>
                                <p>Upload video sessions for students.</p>
                            </div>
                            <div className="card" onClick={() => navigate('/teacher/create-quiz')}>
                                <h3>Create Quiz</h3>
                                <p>Create quizzes for students to practice.</p>
                            </div>
                            <div className="card">
                                <h3>My Kuppi Sessions</h3>
                                <p>Manage your uploaded sessions.</p>
                            </div>
                            <div className="card">
                                <h3>My Quizzes</h3>
                                <p>View and manage your quizzes.</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
