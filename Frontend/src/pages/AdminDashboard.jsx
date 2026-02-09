
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
    return (
        <div className="layout-container">
            <Sidebar role="admin" />
            <div className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <h1>Admin Dashboard</h1>
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
            </div>
        </div>
    );
};

export default AdminDashboard;
