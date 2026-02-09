
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AddTeacher = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        contactNo: '',
        nic: '',
        experience: '',
        qualification: '',
        subject: '',
        gender: '',
        dob: ''
    });
    const [profilePic, setProfilePic] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            // Append all text fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Append profile picture if exists
            if (profilePic) {
                data.append('profilePic', profilePic);
            }

            const response = await fetch('http://localhost:5000/api/auth/add-teacher', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });
            const resData = await response.json();

            if (resData.success) {
                navigate('/admin/teachers');
            } else {
                setError(resData.error || 'Failed to add teacher');
            }
        } catch (err) {
            setError('Error connecting to server');
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Add New Teacher</h1>
                <Link to="/admin/teachers" className="btn-secondary">Back to List</Link>
            </header>

            <div className="form-container">
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="teacher-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-group">
                            <label>Profile Picture</label>
                            <input type="file" onChange={handleFileChange} accept="image/*" />
                        </div>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" name="password" onChange={handleChange} required minLength="6" />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" name="dob" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" onChange={handleChange} required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea name="address" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input type="tel" name="contactNo" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>NIC</label>
                            <input type="text" name="nic" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Professional Information</h3>
                        <div className="form-group">
                            <label>Subject</label>
                            <input type="text" name="subject" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Qualification</label>
                            <input type="text" name="qualification" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Experience (Years/Description)</label>
                            <input type="text" name="experience" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary">Add Teacher</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTeacher;
