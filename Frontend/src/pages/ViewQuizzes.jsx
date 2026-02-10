import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { quizAPI } from '../services/api';

const ViewQuizzes = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const data = await quizAPI.getQuizzes();
            if (data.success) {
                setQuizzes(data.data);
            } else {
                setError(data.error || 'Failed to load quizzes');
            }
        } catch (err) {
            setError('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/student/take-quiz/${quizId}`);
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await quizAPI.deleteQuiz(quizId);
                setQuizzes(quizzes.filter(q => q._id !== quizId));
                alert('Quiz deleted successfully');
            } catch (err) {
                alert('Delete failed: ' + err.message);
            }
        }
    };

    return (
        <div className="layout-container">
            <Sidebar role="teacher" />
            <div className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <h1>Available Quizzes</h1>
                        <button onClick={() => navigate('/teacher/create-quiz')} className="btn-primary">
                            Create New Quiz
                        </button>
                    </header>

                    {loading && <p>Loading quizzes...</p>}
                    {error && <div className="error-message">{error}</div>}

                    <div className="quizzes-grid">
                        {quizzes.length === 0 ? (
                            <p>No quizzes available yet.</p>
                        ) : (
                            quizzes.map((quiz) => (
                                <div key={quiz._id} className="quiz-card">
                                    <h3>{quiz.title}</h3>
                                    <p className="quiz-subject">Subject: {quiz.subject}</p>
                                    <p className="quiz-description">{quiz.description}</p>
                                    <div className="quiz-meta">
                                        <span>📝 {quiz.totalQuestions} Questions</span>
                                        <span>⏱️ {quiz.timeLimit} mins</span>
                                    </div>
                                    <p className="quiz-date">
                                        Created: {new Date(quiz.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="quiz-actions">
                                        <button 
                                            onClick={() => handleStartQuiz(quiz._id)}
                                            className="btn-primary"
                                        >
                                            Take Quiz
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                            className="btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewQuizzes;