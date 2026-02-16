import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import CheatingAlert from '../components/CheatingAlert';

const TeacherDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gray-50">
            <CheatingAlert />
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
                                {/* Create Quiz Card */}
                                <div className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-green-300 cursor-pointer"
                                     onClick={() => navigate('/teacher/create-quiz')}>
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
                                        Create Quiz
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Create quizzes for students to practice.
                                    </p>
                                </div>

                                {/* My Quizzes Card */}
                                <div className="group bg-white p-6 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-orange-300 cursor-pointer"
                                     onClick={() => navigate('/teacher/view-quizzes')}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-2xl shadow-lg">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-orange-600 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                                        My Quizzes
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        View and manage your quizzes.
                                    </p>
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
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
