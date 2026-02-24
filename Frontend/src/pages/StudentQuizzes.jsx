import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import { quizAPI } from '../services/api';

const StudentQuizzes = () => {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('available');
    const [enrollKey, setEnrollKey] = useState('');
    const [enrollPassword, setEnrollPassword] = useState('');
    const [enrollError, setEnrollError] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [availableQuizzes, setAvailableQuizzes] = useState([]);
    const [quizzesLoading, setQuizzesLoading] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizPassword, setQuizPassword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null); // 'AL' | 'OL'

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token || user?.role !== 'student') {
            setError('Please log in as a student to view quizzes.');
            setLoading(false);
            return;
        }
        fetchData();
        fetchAvailableQuizzes();
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

    const fetchAvailableQuizzes = async () => {
        try {
            setQuizzesLoading(true);
            const res = await quizAPI.getQuizzes();
            if (res.success) setAvailableQuizzes(res.data || []);
        } catch (err) {
            console.error('Failed to fetch quizzes:', err);
        } finally {
            setQuizzesLoading(false);
        }
    };

    const handleQuizEnroll = async (quiz) => {
        if (!quizPassword.trim()) {
            setEnrollError('Please enter the quiz password');
            return;
        }
        setEnrolling(true);
        setEnrollError('');
        try {
            const data = await quizAPI.enrollToQuiz({ 
                enrollmentKey: quiz.enrollmentKey, 
                quizPassword: quizPassword 
            });
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

    const isQuizActive = (quiz) => {
        if (!quiz.isActive) return false;
        if (!quiz.enrollmentStartTime || !quiz.enrollmentEndTime) return false;
        const now = new Date();
        return now >= new Date(quiz.enrollmentStartTime) && now <= new Date(quiz.enrollmentEndTime);
    };

    const fmtEnrollEnd = (d) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
             + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
            <StudentNavbar />
            
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative max-w-3xl mx-auto px-4 py-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shadow-lg">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Quizzes</h1>
                            <p className="text-white/80 mt-1">Join a quiz with your enrollment key, or review your past results.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 -mt-4">

                {/* Category Gate — shown until student picks AL or OL */}
                {!selectedCategory ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-md mx-auto text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Exam Category</h2>
                        <p className="text-gray-500 text-sm mb-8">Choose your exam level to view the relevant quizzes.</p>
                        <div className="flex gap-4">
                            {[{id:'AL', label:'Advanced Level', sub:'A/L'}, {id:'OL', label:'Ordinary Level', sub:'O/L'}].map((cat) => (
                                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                    className="flex-1 py-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                                    <p className="text-3xl font-extrabold text-indigo-600 group-hover:text-indigo-700">{cat.sub}</p>
                                    <p className="text-xs font-semibold text-gray-500 mt-1 group-hover:text-gray-700">{cat.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                <>

                {/* Category Badge */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {selectedCategory === 'AL' ? 'A/L — Advanced Level' : 'O/L — Ordinary Level'}
                    </span>
                    <button onClick={() => { setSelectedCategory(null); setSelectedQuiz(null); setQuizPassword(''); setEnrollError(''); }}
                        className="text-xs text-gray-400 hover:text-indigo-600 underline transition-colors">Change category</button>
                </div>

                {/* Enhanced Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-white rounded-2xl p-2 shadow-lg border border-gray-100">
                    <button onClick={() => {setActiveTab('available'); setSelectedQuiz(null); setQuizPassword(''); setEnrollError('');}}
                        className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'available' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Available Quizzes
                    </button>
                    <button onClick={() => {setActiveTab('enroll'); setSelectedQuiz(null); setQuizPassword(''); setEnrollError('');}}
                        className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'enroll' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Join Quiz
                    </button>
                    <button onClick={() => {setActiveTab('results'); setSelectedQuiz(null); setQuizPassword(''); setEnrollError('');}}
                        className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'results' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        My Results{totalAttempts > 0 ? ` (${totalAttempts})` : ''}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {activeTab === 'available' && (
                    quizzesLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mr-4"></div>
                            <span className="text-gray-500">Loading available quizzes...</span>
                        </div>
                    ) : selectedQuiz ? (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md mx-auto relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            <button onClick={() => {setSelectedQuiz(null); setQuizPassword(''); setEnrollError('');}} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            
                            <div className="relative text-center mb-8 pt-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedQuiz.title}</h2>
                                {selectedQuiz.subject && <p className="text-sm font-semibold text-indigo-500 mt-1 uppercase tracking-wide">{selectedQuiz.subject}</p>}
                                <div className="flex justify-center gap-4 mt-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {selectedQuiz.questions?.length || 0} Questions</span>
                                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {selectedQuiz.timeLimit} min</span>
                                </div>
                            </div>
                            
                            {enrollError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm text-center flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {enrollError}
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Enter Quiz Password</label>
                                    <div className="relative">
                                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <input type="password" value={quizPassword} onChange={(e) => setQuizPassword(e.target.value)}
                                            placeholder="Enter password to start quiz"
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-gray-50/50" />
                                    </div>
                                </div>
                                <button onClick={() => handleQuizEnroll(selectedQuiz)} disabled={enrolling || !quizPassword.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {enrolling ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Start Quiz
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : availableQuizzes.filter(q => q.examCategory === selectedCategory && isQuizActive(q)).length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-14 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-gray-700 font-bold text-lg">No active {selectedCategory} quizzes right now</p>
                            <p className="text-gray-400 text-sm mt-2 mb-6">There are no currently active quizzes for your category. Check back later or join using an enrollment key.</p>
                            <button onClick={() => setActiveTab('enroll')} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2 mx-auto">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Join with Key
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableQuizzes.filter(q => q.examCategory === selectedCategory && isQuizActive(q)).map((quiz) => (
                                <div key={quiz._id} className="bg-white rounded-2xl border-2 border-emerald-400 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{quiz.title}</h3>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Active
                                                        </span>
                                                    </div>
                                                    {quiz.subject && <p className="text-xs font-semibold text-teal-600 mt-0.5 uppercase tracking-wide">{quiz.subject}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-3 line-clamp-2">{quiz.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {quiz.questions?.length || 0} Questions</span>
                                            <span className="flex items-center gap-1 font-semibold text-gray-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {quiz.timeLimit} min</span>
                                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> {quiz.maxAttempts} attempt{quiz.maxAttempts > 1 ? 's' : ''}</span>
                                            {quiz.enrollmentEndTime && (
                                                <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    Available until {fmtEnrollEnd(quiz.enrollmentEndTime)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end">
                                            <button onClick={() => { setSelectedQuiz(quiz); setQuizPassword(''); setEnrollError(''); }}
                                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Enroll Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'enroll' && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md mx-auto relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>
                        
                        <div className="relative text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Enter Quiz Credentials</h2>
                            <p className="text-gray-500 text-sm mt-2">Your teacher will provide the key and password.</p>
                        </div>
                        
                        {enrollError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm text-center flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {enrollError}
                            </div>
                        )}
                        
                        <form onSubmit={handleEnrollSubmit} className="space-y-5 relative">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Enrollment Key</label>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <input type="text" value={enrollKey} onChange={(e) => setEnrollKey(e.target.value)}
                                        placeholder="e.g. MATH-QUAD-2026"
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-gray-50/50" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Quiz Password</label>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <input type="password" value={enrollPassword} onChange={(e) => setEnrollPassword(e.target.value)}
                                        placeholder="Enter quiz password"
                                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-gray-50/50" required />
                                </div>
                            </div>
                            <button type="submit" disabled={enrolling}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {enrolling ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Start Quiz
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'results' && (
                    loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mr-4"></div>
                            <span className="text-gray-500">Loading results...</span>
                        </div>
                    ) : totalAttempts === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-14 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-gray-700 font-bold text-lg">No results yet</p>
                            <p className="text-gray-400 text-sm mt-2 mb-6">Take a quiz and your results will appear here.</p>
                            <button onClick={() => setActiveTab('enroll')} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center gap-2 mx-auto">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Join a Quiz
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Quizzes Done', value: uniqueQuizzes, color: 'text-indigo-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                                    { label: 'Total Attempts', value: totalAttempts, color: 'text-violet-600', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                                    { label: 'Average Score', value: avgScore + '%', color: scoreColor(avgScore), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                    { label: 'Passed', value: passCount + '/' + totalAttempts, color: 'text-emerald-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                                ].map((s, idx) => (
                                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-md p-5 hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className={`w-4 h-4 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                                            </svg>
                                            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                                        </div>
                                        <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5">
                                {quizGroups.map(({ qid, sorted, info, bestPct }) => {
                                    const title = info?.title || 'Unknown Quiz';
                                    const subject = info?.subject || '';
                                    const maxAtt = info?.maxAttempts || 1;
                                    const usedAtt = sorted.length;
                                    return (
                                        <div key={qid} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                            <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-gray-800 text-base leading-tight truncate">{title}</h3>
                                                            {subject && <p className="text-xs font-semibold text-indigo-500 mt-0.5 uppercase tracking-wide">{subject}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${scoreBadge(bestPct)}`}>
                                                            Best: {Math.round(bestPct)}%
                                                        </span>
                                                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                            {usedAtt}/{maxAtt} attempt{maxAtt > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                                        <span className="font-medium">Best score</span>
                                                        <span className="font-bold">{Math.round(bestPct)}%</span>
                                                    </div>
                                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${scoreBg(bestPct)}`} style={{ width: Math.round(bestPct) + '%' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="divide-y divide-gray-100">
                                                {sorted.map((attempt, idx) => {
                                                    const pct = Math.round(attempt.percentage);
                                                    const raw = Math.round((attempt.score / attempt.totalQuestions) * 100);
                                                    const passed = pct >= 50;
                                                    const hasPenalty = attempt.tabSwitchDeduction > 0;
                                                    const attemptNum = usedAtt - idx;
                                                    return (
                                                        <div key={attempt._id || idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                                        {attemptNum}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-xs text-gray-400 font-medium">{fmtDate(attempt.completedAt || attempt.createdAt)}</p>
                                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                            <span className="text-sm font-semibold text-gray-700">{attempt.score}/{attempt.totalQuestions} correct</span>
                                                                            {hasPenalty && <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full">- {attempt.tabSwitchDeduction}% penalty</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    {hasPenalty && <span className="text-xs text-gray-400 line-through font-medium">{raw}%</span>}
                                                                    <span className={`text-xl font-extrabold ${scoreColor(pct)}`}>{pct}%</span>
                                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                                        {passed ? 'Pass' : 'Fail'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
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
                </>
                )}
            </div>
        </div>
    );
};

export default StudentQuizzes;
