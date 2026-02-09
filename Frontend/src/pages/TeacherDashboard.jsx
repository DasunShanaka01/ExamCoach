import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const TeacherDashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="teacher" />
            <div className="flex-1 ml-64">
                <TopNavbar role="teacher" pageName="Dashboard" />
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">Teacher Dashboard</h1>
                            <p className="text-gray-600">Welcome back! Manage your classes and students.</p>
                        </header>

                        <main>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* My Classes Card */}
                                <div className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        My Classes
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Manage your classes and students.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-sm font-semibold text-blue-600">0 Active Classes</p>
                                    </div>
                                </div>

                                {/* Assignments Card */}
                                <div className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-green-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
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
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                                        Assignments
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Create and grade assignments.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-sm font-semibold text-green-600">0 Pending Reviews</p>
                                    </div>
                                </div>

                                {/* Students Card */}
                                <div className="group bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-3xl shadow-lg">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-white text-opacity-80">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        Total Students
                                    </h3>
                                    <p className="text-white text-opacity-90 text-sm">
                                        Students across all your classes.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                                        <p className="text-2xl font-bold">0</p>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 md:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">Today's Schedule</h3>
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <p className="text-sm text-gray-600">No classes scheduled for today</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-2">
                                        <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-700">
                                            + Create Assignment
                                        </button>
                                        <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium text-green-700">
                                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            View Reports
                                        </button>
                                        <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium text-purple-700">
                                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Message Students
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
