import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const StudentNavbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [profilePic, setProfilePic] = useState('');

    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !user) return;

                const response = await fetch(`http://localhost:5000/api/students/profile/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data.profilePic) {
                        setProfilePic(data.data.profilePic);
                    }
                }
            } catch (err) {
                console.error('Error fetching profile picture:', err);
            }
        };

        fetchProfilePic();
    }, [user?.id]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
            <div className="navbar-brand">
                <Link
                    to="/student/home"
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                >
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    ExamCoach
                </Link>
            </div>

            <div className="flex gap-8">
                <Link
                    to="/student/home"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors relative group"
                >
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                    to="/student/courses"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors relative group"
                >
                    My Courses
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                
                <Link
                    to="/student/ai_learning_lab"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors relative group"
                >
                    AI Learning Lab
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>


                <Link
                    to="/student/profile"
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors relative group"
                >
                    Profile
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <span className="font-medium text-gray-800">{user?.name}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default StudentNavbar;
