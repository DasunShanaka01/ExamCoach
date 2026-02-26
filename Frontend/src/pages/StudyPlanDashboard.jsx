import { useState, useEffect } from 'react';
import StudentLayout from '../layouts/StudentLayout';
import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import GoogleCalendarConnect from '../components/GoogleCalendarConnect';

const StudyPlanDashboard = () => {
    const [plan, setPlan] = useState(null);
    const [progress, setProgress] = useState(null);
    const [timetableProgress, setTimetableProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logTime, setLogTime] = useState({ hours: 0, minutes: 0 });
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [planRes, progRes, timetableProgRes] = await Promise.all([
                fetch('http://localhost:5000/api/study-plan', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/study-plan/today-progress', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/study-plan/progress', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const planData = await planRes.json();
            const progData = await progRes.json();
            const timetableProgData = await timetableProgRes.json();

            if (planData.success) setPlan(planData.data);
            if (progData.success) setProgress(progData.data);
            if (timetableProgData.success) setTimetableProgress(timetableProgData.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (day, taskIndex) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/study-plan/timetable/task/${day}/${taskIndex}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogTime = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan/log-time', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logTime)
            });
            const data = await response.json();
            if (data.success) {
                fetchData();
                setLogTime({ hours: 0, minutes: 0 });
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <StudentLayout><div className="flex justify-center p-12">Loading...</div></StudentLayout>;

    if (!plan) return (
        <StudentLayout>
            <div className="bg-white p-12 rounded-3xl shadow-xl text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to ExamCoach!</h2>
                <p className="text-gray-600 mb-8">Start your journey by creating a personalized study plan.</p>
                <button
                    onClick={() => window.location.href = '/student/create-plan'}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                    Create My First Plan
                </button>
            </div>
        </StudentLayout>
    );

    const nextExam = plan.subjects.sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0];
    const daysLeft = Math.ceil((new Date(nextExam.examDate) - new Date()) / (1000 * 3600 * 24));

    return (
        <StudentLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Progress */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section / Welcome */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold mb-2">My Study Progress</h1>
                            <p className="opacity-90">Keep up the great work! You're one step closer to your goals.</p>

                            <div className="mt-8 flex gap-6">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                                    <p className="text-xs uppercase tracking-wider font-bold opacity-70 mb-1">Overall Progress</p>
                                    <p className="text-2xl font-bold">{timetableProgress?.overall?.completionPercentage || 0}%</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                                    <p className="text-xs uppercase tracking-wider font-bold opacity-70 mb-1">Tasks Done</p>
                                    <p className="text-2xl font-bold">{timetableProgress?.overall?.completedTasks || 0}/{timetableProgress?.overall?.totalTasks || 0}</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                    </div>

                    {/* Today's Tasks */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                Today's Tasks
                            </h2>
                            <button
                                onClick={() => window.location.href = '/student/timetable'}
                                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                View Full Timetable <FiArrowRight />
                            </button>
                        </div>

                        {timetableProgress?.todaySchedule && timetableProgress.todaySchedule.tasks?.length > 0 ? (
                            <div className="space-y-3">
                                {timetableProgress.todaySchedule.tasks.map((task, idx) => (
                                    <div 
                                        key={idx}
                                        className={`p-4 bg-gray-50 rounded-2xl transition-all border ${
                                            task.isCompleted 
                                                ? 'border-green-200 bg-green-50' 
                                                : 'border-transparent hover:border-blue-100 hover:bg-white hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => handleToggleTask(timetableProgress.todaySchedule.day, idx)}
                                                className="flex-shrink-0 mt-1"
                                            >
                                                {task.isCompleted ? (
                                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                        <FiCheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-blue-500 transition-colors"></div>
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={`font-bold ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                        {task.topic}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                        task.type === 'study' 
                                                            ? 'bg-blue-100 text-blue-700' 
                                                            : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {task.type === 'study' ? 'Study' : 'Revision'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">{task.subject}</p>
                                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                                    <FiClock className="w-3 h-3" />
                                                    <span className="text-xs font-semibold">{task.durationMinutes} min</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Progress for today */}
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-blue-900">Today's Progress</span>
                                        <span className="text-sm font-bold text-blue-900">
                                            {timetableProgress.todaySchedule.completedMinutes}/{timetableProgress.todaySchedule.totalMinutes} min
                                        </span>
                                    </div>
                                    <div className="bg-blue-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-blue-600 h-full transition-all duration-500"
                                            style={{ 
                                                width: `${(timetableProgress.todaySchedule.completedMinutes / timetableProgress.todaySchedule.totalMinutes) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {plan.generatedPlan.slice(0, 3).map((subPlan, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-blue-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{subPlan.subject}</p>
                                                    <p className="text-xs text-gray-400 font-medium uppercase">{subPlan.allocatedMinutes} Minutes Allocated</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-tighter">View Details</span>
                                                <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                                                    <FiArrowRight />
                                                </div>
                                            </div>
                                        </div>
                                        {plan.subjects.find(s => s.name === subPlan.subject)?.topics?.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Topics to cover:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {plan.subjects.find(s => s.name === subPlan.subject).topics.slice(0, 3).map((topic, tidx) => (
                                                        <span key={tidx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                    {plan.subjects.find(s => s.name === subPlan.subject).topics.length > 3 && (
                                                        <span className="text-xs text-gray-400 px-2 py-1">
                                                            +{plan.subjects.find(s => s.name === subPlan.subject).topics.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Widgets */}
                <div className="space-y-8">
                    {/* Countdown Widget */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <FiAlertCircle className="text-red-500 text-xl animate-pulse" />
                        </div>
                        <p className="text-xs uppercase tracking-widest font-black text-gray-400 mb-2">Next Exam Countdown</p>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{nextExam.name}</h3>

                        <div className="flex justify-center gap-4 mb-4">
                            <div className="w-20 h-24 bg-red-50 rounded-2xl flex flex-col items-center justify-center border-b-4 border-red-500">
                                <span className="text-3xl font-black text-red-600">{daysLeft}</span>
                                <span className="text-[10px] font-bold text-red-400 uppercase">Days</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Exam Date: {new Date(nextExam.examDate).toLocaleDateString()}</p>
                    </div>

                    {/* Today Study Log */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <FiClock className="text-orange-500" />
                            Log Study Time
                        </h2>

                        <form onSubmit={handleLogTime} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Hours</label>
                                    <input
                                        type="number"
                                        min="0" max="23"
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-center font-bold text-gray-700 focus:ring-2 focus:ring-orange-500"
                                        value={logTime.hours}
                                        onChange={(e) => setLogTime({ ...logTime, hours: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Minutes</label>
                                    <input
                                        type="number"
                                        min="0" max="59"
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-center font-bold text-gray-700 focus:ring-2 focus:ring-orange-500"
                                        value={logTime.minutes}
                                        onChange={(e) => setLogTime({ ...logTime, minutes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                            >
                                <FiCheckCircle /> Update Progress
                            </button>
                        </form>
                    </div>

                    {/* Google Calendar Widget */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FiCalendar className="text-blue-500" />
                            Calendar Sync
                        </h2>
                        <GoogleCalendarConnect />
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <button
                                disabled={syncing}
                                className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                <FiRefreshCw className={syncing ? 'animate-spin' : ''} /> Sync Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudyPlanDashboard;
