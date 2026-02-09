import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const AdminDashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="admin" />
            <div className="flex-1 ml-64">
                <TopNavbar role="admin" pageName="Dashboard" />
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                            <p className="text-gray-600">Welcome back! Here's your overview.</p>
                        </header>

                        <main>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Teachers Card */}
                                <Link
                                    to="/admin/teachers"
                                    className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                        Manage Teachers
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Add, view, update, and delete teachers.
                                    </p>
                                </Link>

                                {/* Students Card */}
                                <Link
                                    to="/admin/students"
                                    className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-green-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-green-600 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                                        Manage Students
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        View and manage all registered students.
                                    </p>
                                </Link>

                                {/* Analytics Card */}
                                <div className="group bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-3xl shadow-lg">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <span className="text-white text-opacity-80">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        System Analytics
                                    </h3>
                                    <p className="text-white text-opacity-90 text-sm">
                                        View performance metrics and reports.
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                                        <p className="text-sm text-white text-opacity-80">Coming Soon</p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">Quick Stats</h3>
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Teachers</span>
                                            <span className="font-bold text-blue-600">--</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Students</span>
                                            <span className="font-bold text-green-600">--</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Active Courses</span>
                                            <span className="font-bold text-purple-600">--</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 md:col-span-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <p className="text-sm text-gray-600">No recent activity to display</p>
                                        </div>
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

export default AdminDashboard;
