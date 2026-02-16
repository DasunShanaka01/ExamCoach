import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { quizAPI } from '../services/api';
import CheatingAlert from '../components/CheatingAlert';

const ViewQuizzes = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchQuizzes(); }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const data = await quizAPI.getQuizzes();
            if (data.success) { setQuizzes(data.data); }
            else { setError(data.error || 'Failed to load quizzes'); }
        } catch (err) { setError('Error: ' + err.message); }
        finally { setLoading(false); }
    };

    const handleUpdateQuiz = (quizId) => { navigate(`/teacher/update-quiz/${quizId}`); };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await quizAPI.deleteQuiz(quizId);
                setQuizzes(quizzes.filter(q => q._id !== quizId));
            } catch (err) { alert('Delete failed: ' + err.message); }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <CheatingAlert />
            <Sidebar role="teacher" />
            <div className="flex-1 ml-64">
                <TopNavbar role="teacher" pageName="View Quizzes" />
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <header className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Available Quizzes</h1>
                                <p className="text-gray-600 mt-1">Browse and manage all quizzes</p>
                            </div>
                            <button onClick={() => navigate('/teacher/create-quiz')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md">
                                + Create New Quiz
                            </button>
                        </header>

                        {loading && <p className="text-gray-500 text-center py-12">Loading quizzes...</p>}
                        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

                        {!loading && quizzes.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                <p className="text-gray-500 text-lg">No quizzes available yet.</p>
                                <button onClick={() => navigate('/teacher/create-quiz')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Create Your First Quiz</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {quizzes.map((quiz) => (
                                    <div key={quiz._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">{quiz.title}</h3>
                                        <p className="text-sm text-blue-600 font-medium mb-2">Subject: {quiz.subject}</p>
                                        <p className="text-gray-600 text-sm mb-4 flex-1">{quiz.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            <span>📝 {quiz.totalQuestions} Questions</span>
                                            <span>⏱️ {quiz.timeLimit} mins</span>
                                            <span>🔄 {quiz.maxAttempts || 1} Attempt{(quiz.maxAttempts || 1) > 1 ? 's' : ''}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-4">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                                        <div className="flex gap-3 mt-auto">
                                            <button onClick={() => navigate(`/teacher/quiz-attempts/${quiz._id}`)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                                View Results
                                            </button>
                                            <button onClick={() => handleUpdateQuiz(quiz._id)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                                Update Quiz
                                            </button>
                                            <button onClick={() => handleDeleteQuiz(quiz._id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewQuizzes;
