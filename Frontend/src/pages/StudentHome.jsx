import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import Footer from '../components/Footer';

const StudentHome = () => {
    const user = JSON.parse(localStorage.getItem('user'));

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

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-2xl">🕐</span>
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <p className="text-gray-600">No recent activity to display</p>
                        </div>
                    </div>
                </div>

                {/* Quick Links and Announcements */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
