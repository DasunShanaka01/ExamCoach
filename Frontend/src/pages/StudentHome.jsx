import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import Footer from '../components/Footer';
import { quizAPI } from '../services/api';

const StudentHome = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const quizzesResponse = await quizAPI.getQuizzes();
            setQuizzes(quizzesResponse.data || []);
        } catch (err) {
            setError('Failed to load content. Please try again.');
            console.error('Error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeQuiz = (quizId) => {
        navigate(`/student/take-quiz/${quizId}`);
    };

    if (loading) {
        return (
            <div className="page-container">
                <StudentNavbar />
                <div className="dashboard-container">
                    <div className="loading">Loading content...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <StudentNavbar />
            <div className="max-w-7xl mx-auto px-8 py-12 flex-1">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Welcome back, <span className="text-blue-600">{user?.name}</span>! 👋
                    </h1>
                    <p className="text-gray-600">Here's what's happening with your learning journey today.</p>
                </header>

                {error && (
                    <div className="mb-5 text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* My Profile Card */}
                    <div className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
                                👤
                            </div>
                            <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                            My Profile
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Manage your profile details and settings here.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                View Profile →
                            </button>
                        </div>
                    </div>

                    {/* My Courses Card */}
                    <div className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-green-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
                                📚
                            </div>
                            <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                            My Courses
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Access your enrolled courses and continue learning.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-semibold text-green-600">0 Active Courses</p>
                        </div>
                    </div>

                    {/* Assignments Card */}
                    <div className="group bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-3xl shadow-lg">
                                📝
                            </div>
                            <span className="text-white text-opacity-80">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                        <h2 className="text-xl font-bold mb-2">
                            Assignments
                        </h2>
                        <p className="text-white text-opacity-90 text-sm">
                            Complete and submit your assignments.
                        </p>
                        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                            <p className="text-sm font-semibold">0 Pending</p>
                        </div>
                    </div>
                </div>

                {/* Available Quizzes Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="text-2xl">📝</span>
                            Available Quizzes
                        </span>
                        <button onClick={() => navigate('/student/quizzes')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View All Quizzes & Results →
                        </button>
                    </h3>
                    {quizzes.length === 0 ? (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <p className="text-gray-600">No quizzes available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.map((quiz) => (
                                <div key={quiz._id} className="group bg-gray-50 p-4 rounded-lg hover:bg-green-50 transition-colors">
                                    <h4 className="font-bold text-gray-800">{quiz.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                                        <p>By: {quiz.createdBy?.name}</p>
                                        <p>Subject: {quiz.createdBy?.subject}</p>
                                        <p>Questions: {quiz.questions?.length || 0}</p>
                                        <p>Duration: {quiz.duration} minutes</p>
                                    </div>
                                    <button
                                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                        onClick={() => handleTakeQuiz(quiz._id)}
                                    >
                                        Take Quiz
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links and Announcements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            Quick Links
                        </h3>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-700">
                                📖 Browse Courses
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium text-green-700">
                                📊 View Grades
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium text-purple-700">
                                💬 Contact Teacher
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📢</span>
                            Announcements
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <p className="text-sm text-gray-700">No new announcements</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default StudentHome;
