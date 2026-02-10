import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import { kuppiAPI, quizAPI } from '../services/api';

const StudentHome = () => {
    const [kuppis, setKuppis] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const [kuppisResponse, quizzesResponse] = await Promise.all([
                kuppiAPI.getKuppis(),
                quizAPI.getQuizzes()
            ]);

            setKuppis(kuppisResponse.data || []);
            setQuizzes(quizzesResponse.data || []);
        } catch (err) {
            setError('Failed to load content. Please try again.');
            console.error('Error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWatchKuppi = (kuppiId) => {
        navigate(`/student/watch-kuppi/${kuppiId}`);
    };

    const handleTakeQuiz = (quizId) => {
        navigate(`/student/take-quiz/${quizId}`);
    };

    if (loading) {
        return (
            <div className="page-container">
                <StudentNavbar />
                <div className="dashboard-container">
                    <div className="loading">Loading content...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <StudentNavbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>Welcome, {user?.name}</h1>
                    <p>Access your learning materials below</p>
                </header>

                {error && (
                    <div className="error-message" style={{ marginBottom: '20px', color: 'red' }}>
                        {error}
                    </div>
                )}

                <main className="dashboard-content">
                    {/* Available Videos Section */}
                    <section className="content-section">
                        <h2>Available Video Sessions</h2>
                        {kuppis.length === 0 ? (
                            <p>No video sessions available at the moment.</p>
                        ) : (
                            <div className="content-grid">
                                {kuppis.map((kuppi) => (
                                    <div key={kuppi._id} className="content-card">
                                        <div className="card-image">
                                            {kuppi.thumbnailUrl ? (
                                                <img
                                                    src={kuppi.thumbnailUrl}
                                                    alt={kuppi.title}
                                                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '150px',
                                                        backgroundColor: '#f0f0f0',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <span>📹</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <h3>{kuppi.title}</h3>
                                            <p>{kuppi.description}</p>
                                            <div className="card-meta">
                                                <span>By: {kuppi.uploadedBy?.name}</span>
                                                <span>Subject: {kuppi.uploadedBy?.subject}</span>
                                                <span>Views: {kuppi.views || 0}</span>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleWatchKuppi(kuppi._id)}
                                            >
                                                Watch Video
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Available Quizzes Section */}
                    <section className="content-section">
                        <h2>Available Quizzes</h2>
                        {quizzes.length === 0 ? (
                            <p>No quizzes available at the moment.</p>
                        ) : (
                            <div className="content-grid">
                                {quizzes.map((quiz) => (
                                    <div key={quiz._id} className="content-card">
                                        <div className="card-content">
                                            <h3>{quiz.title}</h3>
                                            <p>{quiz.description}</p>
                                            <div className="card-meta">
                                                <span>By: {quiz.createdBy?.name}</span>
                                                <span>Subject: {quiz.createdBy?.subject}</span>
                                                <span>Questions: {quiz.questions?.length || 0}</span>
                                                <span>Duration: {quiz.duration} minutes</span>
                                            </div>
                                            <button
                                                className="btn-primary"
                                                onClick={() => handleTakeQuiz(quiz._id)}
                                            >
                                                Take Quiz
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default StudentHome;
