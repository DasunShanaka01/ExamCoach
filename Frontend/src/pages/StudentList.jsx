import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="admin" />
            <div className="flex-1 ml-64">
                <TopNavbar role="admin" pageName="Manage Students" />
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Students</h1>
                            <p className="text-gray-600">View and manage all registered students</p>
                        </header>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md">
                                <p className="font-medium">{error}</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Profile</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DOB</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {students.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <span className="text-5xl">👨‍🎓</span>
                                                            <p className="text-gray-500 font-medium">No students registered yet</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map(student => (
                                                    <tr key={student._id} className="hover:bg-blue-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <img
                                                                src={student.profilePic || 'https://via.placeholder.com/40'}
                                                                alt="Profile"
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-gray-900">
                                                                {student.firstName} {student.lastName}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-gray-600">{student.user?.email || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                            {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.gender === 'Male' ? 'bg-blue-100 text-blue-800' :
                                                                student.gender === 'Female' ? 'bg-pink-100 text-pink-800' :
                                                                    'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                {student.gender || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleDelete(student._id)}
                                                                className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors shadow-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentList;
