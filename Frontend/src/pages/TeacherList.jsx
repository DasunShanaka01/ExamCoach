
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/teachers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTeachers(data.data);
            } else {
                setError('Failed to fetch teachers');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/teachers/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setTeachers(teachers.filter(teacher => teacher._id !== id));
                } else {
                    alert('Failed to delete teacher');
                }
            } catch (err) {
                alert('Error deleting teacher');
            }
        }
    };

    return (
        <div className="layout-container">
            <Sidebar role="admin" />
            <div className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <h1>Manage Teachers</h1>
                    </header>

                    <div className="action-bar">
                        <Link to="/admin/add-teacher" className="btn-primary">Add New Teacher</Link>
                    </div>

                    {loading ? <p>Loading...</p> : error ? <p className="error-message">{error}</p> : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Subject</th>
                                        <th>Contact</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map(teacher => (
                                        <tr key={teacher._id}>
                                            <td>{teacher.name}</td>
                                            <td>{teacher.user?.email || 'N/A'}</td>
                                            <td>{teacher.subject}</td>
                                            <td>{teacher.contactNo}</td>
                                            <td>
                                                <button onClick={() => handleDelete(teacher._id)} className="btn-danger">Delete</button>
                                                {/* Add Edit button link here if needed */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherList;
