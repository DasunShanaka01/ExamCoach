import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import GoogleCalendarConnect from '../components/GoogleCalendarConnect';

const StudyPlanResult = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [todayProgress, setTodayProgress] = useState(null);
    const [studyHours, setStudyHours] = useState(0);
    const [studyMinutes, setStudyMinutes] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchPlan();
        fetchTodayProgress();
    }, []);

    const fetchPlan = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setPlan(data.data);
            } else {
                // If no plan, redirect to create
                if (response.status === 404) {
                    navigate('/student/create-plan');
                } else {
                    setError('Failed to load study plan');
                }
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your study plan?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                navigate('/student/create-plan');
            } else {
                alert('Failed to delete plan');
            }
        } catch (err) {
            alert('Error deleting plan');
        }
    };

    const handleAddTask = async (subjectName, taskText) => {
        if (!taskText.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan/task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subjectName, taskText })
            });

            if (response.ok) {
                fetchPlan(); // Reload to show new task
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleToggleTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/study-plan/task/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchPlan(); // Reload to update state
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const fetchTodayProgress = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan/today-progress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTodayProgress(data.data);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const handleLogTime = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan/log-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ hours: studyHours, minutes: studyMinutes })
            });

            const data = await response.json();
            if (data.success) {
                // Refresh progress
                fetchTodayProgress();
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error logging time:', error);
        }
    };

    const handleEditTime = () => {
        if (todayProgress?.todayLog) {
            setStudyHours(todayProgress.todayLog.hoursStudied);
            setStudyMinutes(todayProgress.todayLog.minutesStudied);
        }
        setIsEditing(true);
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
        if (hours > 0) return `${hours} hr`;
        return `${mins} min`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <StudentNavbar />
                <div className="max-w-4xl mx-auto px-8 py-12">
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!plan) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <StudentNavbar />
            <div className="max-w-6xl mx-auto px-8 py-12">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Your Personalized Study Plan</h1>
                    </div>
                    <div>
                        <Link
                            to="/student/create-plan"
                            state={{ plan }}
                            className="text-blue-600 hover:text-blue-800 font-semibold mr-6"
                        >
                            Edit Plan
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Delete Plan
                        </button>
                    </div>
                </div>

                {/* Next Exam Warning Box */}
                {plan.daysUntilNextExam !== undefined && (
                    <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-red-800 mb-1">
                                    ⚠️ Upcoming Exam Alert
                                </h3>
                                <p className="text-red-700 text-base">
                                    Next exam in <span className="font-bold text-xl">{plan.daysUntilNextExam}</span> {plan.daysUntilNextExam === 1 ? 'day' : 'days'}!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Google Calendar Integration */}
                <GoogleCalendarConnect studentId={user?.profile?._id} studyPlanId={plan?._id} />

                {/* Daily Schedule and Stats - Moved to Top */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Stats Cards */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Daily Goal</h3>
                            <p className="text-4xl font-bold text-blue-600">{plan.studyHoursPerDay} <span className="text-lg text-gray-400 font-normal">hours</span></p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">My Subjects</h3>
                            <div className="flex flex-col gap-2">
                                {plan.subjects.map((sub, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sub.isWeak
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-green-100 text-green-800 border border-green-200'
                                            }`}>
                                            {sub.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {new Date(sub.examDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                            <h3 className="text-white text-opacity-80 text-sm font-semibold uppercase mb-4">Motivation</h3>
                            <p className="text-lg italic">"Consistency is the key to mastery. Stick to the plan!"</p>
                        </div>
                    </div>

                    {/* Daily Schedule */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800">Daily Schedule Breakdown</h3>
                                <p className="text-xs text-gray-400 mt-1">Allocated based on exam urgency and weakness</p>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {plan.generatedPlan.map((item, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${item.isWeak ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {item.subject.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-lg">{item.subject}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            Exam: {new Date(item.examDate).toLocaleDateString()}
                                                        </span>
                                                        {item.isWeak && (
                                                            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 rounded">Focus Area</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-800">{formatTime(item.allocatedMinutes)}</p>
                                            </div>
                                        </div>

                                        {/* Task List Section */}
                                        <div className="pl-16">
                                            <div className="space-y-2 mb-3">
                                                {item.tasks && item.tasks.map((task, tIndex) => (
                                                    <div key={tIndex} className="flex items-center gap-3 group">
                                                        <input
                                                            type="checkbox"
                                                            checked={task.isCompleted}
                                                            onChange={() => handleToggleTask(task._id)}
                                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                        />
                                                        <span className={`text-sm ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                            {task.text}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add a task..."
                                                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 w-full max-w-xs"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddTask(item.subject, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling;
                                                        if (input.value) {
                                                            handleAddTask(item.subject, input.value);
                                                            input.value = '';
                                                        }
                                                    }}
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <p className="text-center text-gray-500 text-sm">
                                    Total: {plan.generatedPlan.reduce((acc, curr) => acc + curr.allocatedMinutes, 0)} minutes / {plan.studyHoursPerDay * 60} minutes planned
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Logging and Progress Section - Moved to Bottom */}
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">⏱️</span>
                            Log Your Study Time
                        </h2>
                        {todayProgress?.todayLog && !isEditing && (
                            <button
                                onClick={handleEditTime}
                                className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Time Input */}
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                {todayProgress?.todayLog && !isEditing ? 'Today\'s Study Time' : 'How much did you study today?'}
                            </label>
                            {todayProgress?.todayLog && !isEditing ? (
                                <div className="text-center py-4">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {todayProgress.todayLog.hoursStudied}h {todayProgress.todayLog.minutesStudied}m
                                    </div>
                                    <p className="text-sm text-gray-500">Logged for today</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">Hours</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={studyHours}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    const num = parseInt(val) || 0;
                                                    if (num >= 0 && num <= 24) setStudyHours(num);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center text-lg font-semibold"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={studyMinutes}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    const num = parseInt(val) || 0;
                                                    if (num >= 0 && num <= 59) setStudyMinutes(num);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-center text-lg font-semibold"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogTime}
                                        className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                    >
                                        {isEditing ? 'Update Time' : 'Log Time'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Progress Display */}
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Today's Progress</label>
                            {todayProgress && todayProgress.todayLog ? (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-500">
                                            Goal: {plan.studyHoursPerDay}h
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {Math.floor((todayProgress.todayLog.totalMinutes / (plan.studyHoursPerDay * 60)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-3">
                                        <div
                                            className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white ${todayProgress.todayLog.totalMinutes >= (plan.studyHoursPerDay * 60) ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}
                                            style={{
                                                width: `${Math.min((todayProgress.todayLog.totalMinutes / (plan.studyHoursPerDay * 60)) * 100, 100)}%`
                                            }}
                                        >
                                            {todayProgress.todayLog.totalMinutes > 0 && (
                                                <span>{Math.floor(todayProgress.todayLog.totalMinutes / 60)}h {todayProgress.todayLog.totalMinutes % 60}m</span>
                                            )}
                                        </div>
                                    </div>
                                    {todayProgress.todayLog.totalMinutes >= (plan.studyHoursPerDay * 60) ? (
                                        todayProgress.todayLog.totalMinutes > (plan.studyHoursPerDay * 60) ? (
                                            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                                <span className="text-green-700 font-semibold text-sm">
                                                    🌟 Outstanding! You've exceeded your daily goal by {Math.floor((todayProgress.todayLog.totalMinutes - (plan.studyHoursPerDay * 60)) / 60)}h{' '}
                                                    {(todayProgress.todayLog.totalMinutes - (plan.studyHoursPerDay * 60)) % 60}m!
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                                <span className="text-green-700 font-semibold text-sm">✓ Perfect! You've completed your daily goal!</span>
                                            </div>
                                        )
                                    ) : (
                                        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                                            <p className="text-xs text-yellow-800">
                                                💡 <strong>Suggestion:</strong> Study extra {Math.floor(((plan.studyHoursPerDay * 60) - todayProgress.todayLog.totalMinutes) / 60)}h{' '}
                                                {((plan.studyHoursPerDay * 60) - todayProgress.todayLog.totalMinutes) % 60}m tomorrow to catch up
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-4xl mb-2">📚</div>
                                    <p className="text-sm font-medium">No study time logged yet</p>
                                    <p className="text-xs mt-1">Start logging to track your progress!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyPlanResult;
