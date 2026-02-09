
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    // navigate is kept for consistency but not strictly used in this component
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

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening the modal when clicking delete
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
                    if (selectedTeacher && selectedTeacher._id === id) {
                        closeModal();
                    }
                } else {
                    alert('Failed to delete teacher');
                }
            } catch (err) {
                alert('Error deleting teacher');
            }
        }
    };

    const handleRowClick = (teacher) => {
        setSelectedTeacher(teacher);
        // Initialize form data with current values (safely handling potential nulls)
        setEditFormData({
            name: teacher.name || '',
            email: teacher.user?.email || '',
            subject: teacher.subject || '',
            contactNo: teacher.contactNo || '',
            address: teacher.address || '',
            qualification: teacher.qualification || '',
            experience: teacher.experience || '',
            gender: teacher.gender || '',
            nic: teacher.nic || '',
            // Format date for input type="date"
            dob: teacher.dob ? new Date(teacher.dob).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
        setIsEditing(false);
    };

    const handleEditClick = (teacher, e) => {
        e.stopPropagation();
        handleRowClick(teacher);
        setIsEditing(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTeacher(null);
        setIsEditing(false);
    };

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/teachers/${selectedTeacher._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });
            const data = await response.json();
            if (data.success) {
                // Update local list with new data
                // Note: The backend returns the updated teacher object. 
                // We merge it carefully to preserve the populated 'user' object structure if needed.
                const updatedTeacher = data.data;
                const newTeachers = teachers.map(t => {
                    if (t._id === selectedTeacher._id) {
                        return {
                            ...t,
                            ...updatedTeacher,
                            // Ensure the user object (email) is updated in the list view
                            user: { ...t.user, email: editFormData.email }
                        };
                    }
                    return t;
                });

                setTeachers(newTeachers);

                // Update selectedTeacher to reflect changes immediately in "Details" view
                setSelectedTeacher({
                    ...selectedTeacher,
                    ...updatedTeacher,
                    user: { ...selectedTeacher.user, email: editFormData.email }
                });

                setIsEditing(false);
                alert('Teacher updated successfully');
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (err) {
            alert('Error updating teacher');
        }
    };

    // Helper to get image URL safely
    const getProfilePicUrl = (picPath) => {
        if (!picPath) return 'https://via.placeholder.com/100';
        if (picPath.startsWith('http')) return picPath;
        return `http://localhost:5000/${picPath}`;
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
                                        <tr
                                            key={teacher._id}
                                            onClick={() => handleRowClick(teacher)}
                                            style={{ cursor: 'pointer' }}
                                            title="Click to view details"
                                        >
                                            <td>{teacher.name}</td>
                                            <td>{teacher.user?.email || 'N/A'}</td>
                                            <td>{teacher.subject}</td>
                                            <td>{teacher.contactNo}</td>
                                            <td>
                                                <button onClick={(e) => handleEditClick(teacher, e)} className="btn-edit">Edit</button>
                                                <button onClick={(e) => handleDelete(teacher._id, e)} className="btn-danger">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Teacher Details Modal */}
            {isModalOpen && selectedTeacher && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Teacher' : 'Teacher Details'}</h2>
                            <button className="btn-close" onClick={closeModal}>&times;</button>
                        </div>

                        <div className="modal-body">
                            {isEditing ? (
                                <div className="edit-form">
                                    <div className="teacher-form"> {/* Reuse existing form grid layout if responsive */}
                                        <div className="modal-form-group">
                                            <label>Name</label>
                                            <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Email</label>
                                            <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Subject</label>
                                            <input type="text" name="subject" value={editFormData.subject} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Contact No</label>
                                            <input type="text" name="contactNo" value={editFormData.contactNo} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Date of Birth</label>
                                            <input type="date" name="dob" value={editFormData.dob} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Address</label>
                                            <textarea name="address" value={editFormData.address} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Qualification</label>
                                            <input type="text" name="qualification" value={editFormData.qualification} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Experience</label>
                                            <input type="text" name="experience" value={editFormData.experience} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>NIC</label>
                                            <input type="text" name="nic" value={editFormData.nic} onChange={handleEditChange} required />
                                        </div>
                                        <div className="modal-form-group">
                                            <label>Gender</label>
                                            <select name="gender" value={editFormData.gender} onChange={handleEditChange} required>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="details-view">
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <img
                                            src={getProfilePicUrl(selectedTeacher.profilePic)}
                                            alt="Profile"
                                            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee' }}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/120'; }}
                                        />
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Name:</span>
                                        <span className="detail-value">{selectedTeacher.name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{selectedTeacher.user?.email || editFormData.email}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Subject:</span>
                                        <span className="detail-value">{selectedTeacher.subject}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Contact:</span>
                                        <span className="detail-value">{selectedTeacher.contactNo}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">DOB:</span>
                                        <span className="detail-value">{selectedTeacher.dob ? new Date(selectedTeacher.dob).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Gender:</span>
                                        <span className="detail-value">{selectedTeacher.gender}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Address:</span>
                                        <span className="detail-value">{selectedTeacher.address}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Qualification:</span>
                                        <span className="detail-value">{selectedTeacher.qualification}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Experience:</span>
                                        <span className="detail-value">{selectedTeacher.experience}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">NIC:</span>
                                        <span className="detail-value">{selectedTeacher.nic}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            {isEditing ? (
                                <>
                                    <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className="btn-primary" onClick={handleUpdate}>Save Changes</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-secondary" onClick={closeModal}>Close</button>
                                    <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Details</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherList;
