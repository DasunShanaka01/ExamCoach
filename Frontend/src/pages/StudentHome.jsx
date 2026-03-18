import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import Footer from '../components/Footer';

const StudentHome = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const [studyPlan, setStudyPlan] = useState(null);

    useEffect(() => {
        fetchStudyPlan();
    }, []);

    const fetchStudyPlan = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStudyPlan(data.data);
            }
        } catch (err) {
            // Silently fail - user might not have a study plan yet
            console.log('No study plan found');
        }
    };


    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
                <StudentNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
            <StudentNavbar />
            
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                            👋
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                                Welcome back, {user?.firstName || user?.name || 'Student'}!
                            </h1>
                            <p className="text-gray-600 mt-1">Here's what's happening with your learning journey today.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex-1">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* My Profile Card */}
                    <div
                        onClick={() => navigate('/student/profile')}
                        className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-2xl opacity-60 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">My Profile</h2>
                            <p className="text-gray-600 text-sm">Manage your profile details and settings here.</p>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                                    View Profile
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* My Quizzes Card */}
                    <div
                        onClick={() => navigate('/student/quizzes')}
                        className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-2xl opacity-60 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">My Quizzes</h2>
                            <p className="text-gray-600 text-sm">View your quiz history and track your progress.</p>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <span className="text-sm font-semibold text-green-600 group-hover:text-green-700 transition-colors flex items-center gap-1">
                                    View Results
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* My Study Plan Card */}
                    <div
                        onClick={() => navigate(studyPlan ? '/student/view-plan' : '/student/create-plan')}
                        className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-60 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">My Study Plan</h2>
                            <p className="text-gray-600 text-sm">
                                {studyPlan ? 'View your personalized study schedule.' : 'Create your personalized study schedule.'}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors flex items-center gap-1">
                                    {studyPlan ? 'View Plan' : 'Create Plan'}
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
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
