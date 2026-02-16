import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import { quizAPI } from '../services/api';

const StudentQuizzes = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('available'); // 'available' | 'results'
    const [expandedQuiz, setExpandedQuiz] = useState(null);

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
            const [quizzesRes, attemptsRes] = await Promise.all([
                quizAPI.getQuizzes(),
                quizAPI.getStudentAttempts()
            ]);
            if (quizzesRes.success) setQuizzes(quizzesRes.data);
            if (attemptsRes.success) setAttempts(attemptsRes.data);
        } catch (err) {
            setError('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/student/take-quiz/${quizId}`);
    };

    const isEnrollmentOpen = (quiz) => {
        if (!quiz.enrollmentStartTime || !quiz.enrollmentEndTime) return true;
        const now = new Date();
        return now >= new Date(quiz.enrollmentStartTime) && now <= new Date(quiz.enrollmentEndTime);
    };

    // Group attempts by quiz
    const attemptsByQuiz = attempts.reduce((acc, attempt) => {
        const quizId = attempt.quiz?._id || attempt.quiz;
        if (!acc[quizId]) acc[quizId] = [];
        acc[quizId].push(attempt);
        return acc;
    }, {});

    // Get unique quizzes that have attempts
    const quizzesWithAttempts = [...new Set(attempts.map(a => a.quiz?._id || a.quiz))];

    const getScoreColor = (pct) => {
        if (pct >= 80) return 'text-green-600';
        if (pct >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (pct) => {
        if (pct >= 80) return 'bg-green-100 text-green-700';
        if (pct >= 50) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <StudentNavbar />
            <div className="max-w-6xl mx-auto p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Quizzes</h1>
                    <p className="text-gray-500 mt-1">Browse quizzes and view your results</p>
                </header>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-6 bg-gray-200 rounded-lg p-1 max-w-md">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'available' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        📝 Available Quizzes
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'results' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        📊 My Results ({attempts.length})
                    </button>
                </div>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-500">Loading...</span>
                    </div>
                ) : activeTab === 'available' ? (
                    /* Available Quizzes Tab */
                    quizzes.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <p className="text-5xl mb-4">📚</p>
                            <p className="text-gray-500 text-lg">No quizzes available right now.</p>
                            <p className="text-gray-400 mt-1">Check back later or contact your teacher.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.map((quiz) => {
                                const enrollOpen = isEnrollmentOpen(quiz);
                                const myAttempts = attemptsByQuiz[quiz._id] || [];
                                const maxAttempts = quiz.maxAttempts || 1;
                                const attemptsLeft = maxAttempts - myAttempts.length;
                                const allUsed = attemptsLeft <= 0;
                                const bestScore = myAttempts.length > 0 ? Math.max(...myAttempts.map(a => a.percentage)) : null;

                                return (
                                    <div key={quiz._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-lg font-bold text-gray-800">{quiz.title}</h3>
                                                {allUsed ? (
                                                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Completed</span>
                                                ) : enrollOpen ? (
                                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Open</span>
                                                ) : (
                                                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Closed</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-blue-600 font-medium mb-2">{quiz.subject}</p>
                                            {quiz.description && <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>}
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                                <span>📝 {quiz.totalQuestions || quiz.questions?.length || 0} Qs</span>
                                                <span>⏱️ {quiz.timeLimit || 30} mins</span>
                                                <span>🔄 {maxAttempts} attempt{maxAttempts > 1 ? 's' : ''}</span>
                                            </div>
                                            {myAttempts.length > 0 && (
                                                <div className="mt-3 p-2.5 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Attempts: {myAttempts.length}/{maxAttempts}</span>
                                                        <span className={`font-bold ${getScoreColor(bestScore)}`}>
                                                            Best: {Math.round(bestScore)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                                            {allUsed ? (
                                                <p className="text-center text-sm text-gray-500 font-medium py-1">All attempts used</p>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartQuiz(quiz._id)}
                                                    disabled={!enrollOpen}
                                                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {myAttempts.length > 0 ? `Retry (${attemptsLeft} left)` : 'Take Quiz →'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* Results Tab */
                    attempts.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <p className="text-5xl mb-4">📊</p>
                            <p className="text-gray-500 text-lg">No quiz results yet.</p>
                            <p className="text-gray-400 mt-1">Take a quiz to see your results here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Summary stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Total Attempts</p>
                                    <p className="text-3xl font-bold text-gray-800">{attempts.length}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Average Score</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)}%
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Quizzes Taken</p>
                                    <p className="text-3xl font-bold text-purple-600">{quizzesWithAttempts.length}</p>
                                </div>
                            </div>

                            {/* Attempts grouped by quiz */}
                            {quizzesWithAttempts.map(quizId => {
                                const quizAttempts = attemptsByQuiz[quizId] || [];
                                const quizInfo = quizAttempts[0]?.quiz;
                                const quizTitle = quizInfo?.title || 'Unknown Quiz';
                                const quizSubject = quizInfo?.subject || '';
                                const maxAttempts = quizInfo?.maxAttempts || 1;
                                const isExpanded = expandedQuiz === quizId;
                                const bestPct = Math.max(...quizAttempts.map(a => a.percentage));
                                const latestPct = quizAttempts[0]?.percentage;

                                return (
                                    <div key={quizId} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => setExpandedQuiz(isExpanded ? null : quizId)}
                                            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{quizTitle}</h3>
                                                <p className="text-sm text-blue-600">{quizSubject}</p>
                                                <p className="text-xs text-gray-400 mt-1">{quizAttempts.length} attempt{quizAttempts.length > 1 ? 's' : ''} / {maxAttempts} max</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 uppercase">Best</p>
                                                    <p className={`text-xl font-bold ${getScoreColor(bestPct)}`}>{Math.round(bestPct)}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 uppercase">Latest</p>
                                                    <p className={`text-xl font-bold ${getScoreColor(latestPct)}`}>{Math.round(latestPct)}%</p>
                                                </div>
                                                <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </div>
                                        </button>
                                        {isExpanded && (
                                            <div className="border-t border-gray-100">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Score</th>
                                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Percentage</th>
                                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {quizAttempts.map((attempt, idx) => {
                                                            const pct = Math.round(attempt.percentage);
                                                            return (
                                                                <tr key={attempt._id || idx} className="border-t border-gray-100 hover:bg-gray-50">
                                                                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                                                                    <td className="px-5 py-3 text-sm font-medium text-gray-700">
                                                                        {attempt.score}/{attempt.totalQuestions}
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(pct)}`}>
                                                                            {pct}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-5 py-3 text-sm text-gray-500">
                                                                        {new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()} {new Date(attempt.completedAt || attempt.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default StudentQuizzes;
