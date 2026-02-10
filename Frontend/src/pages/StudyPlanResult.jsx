import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';

const StudyPlanResult = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlan();
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

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Your Personalized Study Plan 🚀</h1>
                        <p className="text-gray-600 mt-2">
                            {plan.daysUntilExam} days left until your exam on {new Date(plan.examDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <Link
                            to="/student/create-plan"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Cards */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Daily Goal</h3>
                            <p className="text-4xl font-bold text-blue-600">{plan.studyHoursPerDay} <span className="text-lg text-gray-400 font-normal">hours</span></p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Focus Areas</h3>
                            <div className="flex flex-wrap gap-2">
                                {plan.subjects.map((sub, idx) => (
                                    <span key={idx} className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.weakSubjects.includes(sub)
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-green-100 text-green-800 border border-green-200'
                                        }`}>
                                        {sub} {plan.weakSubjects.includes(sub) && '🔥'}
                                    </span>
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
                            </div>
                            <div className="divide-y divide-gray-100">
                                {plan.generatedPlan.map((item, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${plan.weakSubjects.includes(item.subject) ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {item.subject.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-lg">{item.subject}</h4>
                                                {plan.weakSubjects.includes(item.subject) && (
                                                    <span className="text-xs text-red-500 font-medium">Focus Area (Extra Time)</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-800">{item.allocatedMinutes} <span className="text-sm text-gray-500 font-normal">min</span></p>
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
            </div>
        </div>
    );
};

export default StudyPlanResult;
