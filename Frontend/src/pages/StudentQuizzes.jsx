import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import { quizAPI } from '../services/api';

const StudentQuizzes = () => {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('enroll');
    const [enrollKey, setEnrollKey] = useState('');
    const [enrollPassword, setEnrollPassword] = useState('');
    const [enrollError, setEnrollError] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'student') {
            setError('Please log in as a student to view quizzes.');
            setLoading(false);
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const attemptsRes = await quizAPI.getStudentAttempts();
            if (attemptsRes.success) setAttempts(attemptsRes.data);
        } catch (err) {
            setError('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        setEnrollError('');
        setEnrolling(true);
        try {
            const data = await quizAPI.enrollToQuiz({ enrollmentKey: enrollKey, quizPassword: enrollPassword });
            if (data.success) {
                navigate(`/student/take-quiz/${data.quizId}?verified=true`);
            } else {
                setEnrollError(data.error || 'Access denied');
            }
        } catch (err) {
            setEnrollError(err.message || 'Verification failed');
        } finally {
            setEnrolling(false);
        }
    };

    const scoreColor  = (pct) => pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500';
    const scoreBg     = (pct) => pct >= 80 ? 'bg-emerald-500'   : pct >= 50 ? 'bg-amber-400'   : 'bg-red-500';
    const scoreBadge  = (pct) => pct >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                           : pct >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                       : 'bg-red-50 text-red-700 border-red-200';
    const fmtDate = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
             + '  ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const attemptsByQuiz = attempts.reduce((acc, a) => {
        const qid = a.quiz?._id || a.quiz;
        if (!acc[qid]) acc[qid] = [];
        acc[qid].push(a);
        return acc;
    }, {});

    const quizGroups = Object.entries(attemptsByQuiz).map(([qid, list]) => {
        const sorted = [...list].sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
        const info = sorted[0]?.quiz;
        const pcts = sorted.map(a => a.percentage);
        return { qid, sorted, info, bestPct: Math.max(...pcts), latestPct: pcts[0] };
    });

    const totalAttempts = attempts.length;
    const uniqueQuizzes = quizGroups.length;
    const avgScore      = totalAttempts ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / totalAttempts) : 0;
    const passCount     = attempts.filter(a => (a.percentage || 0) >= 50).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <StudentNavbar />
            <div className="max-w-3xl mx-auto px-4 py-8">

                <header className="mb-7">
                    <h1 className="text-2xl font-bold text-gray-800">My Quizzes</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Join a quiz with your enrollment key, or review your past results.</p>
                </header>

                <div className="flex gap-1 mb-7 bg-gray-100 rounded-xl p-1 w-fit">
                    <button onClick={() => setActiveTab('enroll')}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'enroll' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        Join Quiz
                    </button>
                    <button onClick={() => setActiveTab('results')}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'results' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        My Results{totalAttempts > 0 ? ` (${totalAttempts})` : ''}
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

                {activeTab === 'enroll' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Enter Quiz Credentials</h2>
                            <p className="text-gray-400 text-sm mt-1">Your teacher will provide the key and password.</p>
                        </div>
                        {enrollError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm text-center">{enrollError}</div>
                        )}
                        <form onSubmit={handleEnrollSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Enrollment Key</label>
                                <input type="text" value={enrollKey} onChange={(e) => setEnrollKey(e.target.value)}
                                    placeholder="e.g. MATH-QUAD-2026"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors" required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Quiz Password</label>
                                <input type="password" value={enrollPassword} onChange={(e) => setEnrollPassword(e.target.value)}
                                    placeholder="Enter quiz password"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors" required />
                            </div>
                            <button type="submit" disabled={enrolling}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                                {enrolling ? 'Verifying...' : 'Start Quiz'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'results' && (
                    loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-gray-400 text-sm">Loading results...</span>
                        </div>
                    ) : totalAttempts === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
                            <p className="text-gray-700 font-semibold text-lg">No results yet</p>
                            <p className="text-gray-400 text-sm mt-1">Take a quiz and your results will appear here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                                {[
                                    { label: 'Quizzes Done',   value: uniqueQuizzes,                    color: 'text-blue-600'     },
                                    { label: 'Total Attempts', value: totalAttempts,                    color: 'text-violet-600'   },
                                    { label: 'Average Score',  value: avgScore + '%',                   color: scoreColor(avgScore) },
                                    { label: 'Passed',         value: passCount + '/' + totalAttempts,  color: 'text-emerald-600'  },
                                ].map(s => (
                                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
                                        <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                                        <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {quizGroups.map(({ qid, sorted, info, bestPct }) => {
                                    const title   = info?.title   || 'Unknown Quiz';
                                    const subject = info?.subject || '';
                                    const maxAtt  = info?.maxAttempts || 1;
                                    const usedAtt = sorted.length;
                                    return (
                                        <div key={qid} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-800 text-base leading-tight truncate">{title}</h3>
                                                        {subject && <p className="text-xs font-semibold text-blue-500 mt-0.5 uppercase tracking-wide">{subject}</p>}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreBadge(bestPct)}`}>
                                                            Best: {Math.round(bestPct)}%
                                                        </span>
                                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                            {usedAtt}/{maxAtt} attempt{maxAtt > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                        <span>Best score</span><span>{Math.round(bestPct)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${scoreBg(bestPct)}`} style={{ width: Math.round(bestPct) + '%' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="divide-y divide-gray-50">
                                                {sorted.map((attempt, idx) => {
                                                    const pct        = Math.round(attempt.percentage);
                                                    const raw        = Math.round((attempt.score / attempt.totalQuestions) * 100);
                                                    const passed     = pct >= 50;
                                                    const hasPenalty = attempt.tabSwitchDeduction > 0;
                                                    const attemptNum = usedAtt - idx;
                                                    return (
                                                        <div key={attempt._id || idx} className="px-6 py-4">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                                        {attemptNum}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs text-gray-400">{fmtDate(attempt.completedAt || attempt.createdAt)}</p>
                                                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                            <span className="text-xs font-medium text-gray-600">{attempt.score}/{attempt.totalQuestions} correct</span>
                                                                            {hasPenalty && <span className="text-xs text-red-500 font-medium">- {attempt.tabSwitchDeduction}% tab penalty</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    {hasPenalty && <span className="text-xs text-gray-400 line-through">{raw}%</span>}
                                                                    <span className={`text-lg font-extrabold ${scoreColor(pct)}`}>{pct}%</span>
                                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                                                        {passed ? 'Pass' : 'Fail'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                                                                <div className={`h-full rounded-full ${scoreBg(pct)}`} style={{ width: pct + '%' }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default StudentQuizzes;
