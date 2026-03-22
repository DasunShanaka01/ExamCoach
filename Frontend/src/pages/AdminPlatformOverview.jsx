import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StatCard = ({ label, value, sub, color }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6`}>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-4xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
);

const AdminPlatformOverview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/admin/overview', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json.success) setData(json.data);
                else setError('Failed to load overview data');
            } catch (err) {
                setError('Server error');
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="admin" />
            <div className="flex-1 ml-64">
                <TopNavbar role="admin" pageName="Platform Overview" />
                <div className="p-8 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Platform Overview</h1>
                        <p className="text-gray-500 mt-1">System-wide analytics and health indicators</p>
                    </header>

                    {loading && (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                    )}

                    {data && (
                        <div className="space-y-8">

                            {/* ── Totals ── */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Total Students" value={data.totals.totalStudents} color="text-blue-600" sub={`+${data.newRegistrations.studentsThisMonth} this month`} />
                                <StatCard label="Total Teachers" value={data.totals.totalTeachers} color="text-green-600" sub={`+${data.newRegistrations.teachersThisMonth} this month`} />
                                <StatCard label="Total Streams" value={data.totals.totalStreams} color="text-purple-600" />
                                <StatCard label="Total Subjects" value={data.totals.totalSubjects} color="text-orange-500" />
                            </div>

                            {/* ── Quick highlights ── */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="New Students (Week)" value={data.newRegistrations.studentsThisWeek} color="text-blue-500" />
                                <StatCard label="New Teachers (Week)" value={data.newRegistrations.teachersThisWeek} color="text-green-500" />
                                <StatCard label="Active Students (30d)" value={data.recentlyActiveStudents} color="text-indigo-600" sub="Registered in last 30 days" />
                                <StatCard label="Google Calendar Integrations" value={data.googleCalendarIntegrations} color="text-teal-600" sub="Students connected" />
                            </div>

                            {/* ── Registration Trend ── */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-6">Registration Trend (Last 8 Weeks)</h2>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={data.registrationTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} name="Students" dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="teachers" stroke="#10B981" strokeWidth={2} name="Teachers" dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* ── AI Usage ── */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-6">AI Usage — Last 6 Months</h2>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <StatCard label="Groq Total" value={data.aiUsage.groqTotal} color="text-violet-600" sub={`Quizzes: ${data.aiUsage.groqQuizzes} · Study Plans: ${data.aiUsage.groqStudyPlans}`} />
                                    <StatCard label="Gemini Total" value={data.aiUsage.geminiTotal} color="text-pink-600" />
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={data.aiUsage.trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="groq" name="Groq" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="gemini" name="Gemini" fill="#EC4899" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPlatformOverview;
