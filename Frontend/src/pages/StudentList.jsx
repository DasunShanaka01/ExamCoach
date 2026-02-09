
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/students', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStudents(data.data);
            } else {
                setError('Failed to fetch students');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/students/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setStudents(students.filter(student => student._id !== id));
                } else {
                    alert('Failed to delete student');
                }
            } catch (err) {
                alert('Error deleting student');
            }
        }
    };

    return (
        <div className="layout-container">
            <Sidebar role="admin" />
            <div className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <h1>Manage Students</h1>
                    </header>

                    {loading ? <p>Loading...</p> : error ? <p className="error-message">{error}</p> : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Profile</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>DOB</th>
                                        <th>Gender</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id}>
                                            <td>
                                                <img
                                                    src={student.profilePic || 'https://via.placeholder.com/40'}
                                                    alt="Profile"
                                                    className="table-avatar"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td> {student.firstName} {student.lastName} </td>
                                            <td>{student.user?.email || 'N/A'}</td>
                                            <td>{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</td>
                                            <td>{student.gender || 'N/A'}</td>
                                            <td>
                                                <button onClick={() => handleDelete(student._id)} className="btn-danger">Delete</button>
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

export default StudentList;
