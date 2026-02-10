import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import { quizAPI } from '../services/api';

const TakeQuiz = () => {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (quiz && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && quiz) {
            handleSubmitQuiz();
        }
    }, [timeLeft, quiz]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await quizAPI.getQuiz(id);
            const quizData = response.data;
            setQuiz(quizData);
            setTimeLeft(quizData.duration * 60); // Convert minutes to seconds
        } catch (err) {
            setError('Failed to load quiz. Please try again.');
            console.error('Error fetching quiz:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);
            const attemptData = {
                answers: Object.entries(answers).map(([questionId, answer]) => {
                    const question = quiz.questions.find(q => q._id === questionId);
                    const selectedIndex = question.options.indexOf(answer);
                    return {
                        selectedAnswer: selectedIndex
                    };
                }),
                timeTaken: Math.floor((quiz.duration * 60 - timeLeft) / 60) // time taken in minutes
            };

            const response = await quizAPI.submitQuizAttempt(id, attemptData);
            setResults(response.data);
            setShowResults(true);
        } catch (err) {
            setError('Failed to submit quiz. Please try again.');
            console.error('Error submitting quiz:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate('/student/home');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="page-container">
                <StudentNavbar />
                <div className="dashboard-container">
                    <div className="loading">Loading quiz...</div>
                </div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="page-container">
                <StudentNavbar />
                <div className="dashboard-container">
                    <div className="error-message">{error || 'Quiz not found'}</div>
                    <button className="btn-secondary" onClick={handleBack}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (showResults && results) {
        const { attempt, results: quizResults } = results.data || results;
        const questionResults = quiz.questions.map((question, index) => {
            const attemptAnswer = attempt?.answers?.[index];
            const userAnswer = attemptAnswer ? question.options[attemptAnswer.selectedAnswer] : 'Not answered';
            const correctAnswer = question.options[question.correctAnswer];
            return {
                question: question.question,
                userAnswer,
                correctAnswer,
                correct: attemptAnswer?.isCorrect || false
            };
        });

        return (
            <div className="page-container">
                <StudentNavbar />
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <h1>Quiz Results</h1>
                    </header>

                    <main className="dashboard-content">
                        <div className="results-container">
                            <div className="result-summary">
                                <h2>{quiz.title} - Results</h2>
                                <div className="score-display">
                                    <div className="score">
                                        <span className="score-number">{quizResults?.score || attempt?.score || 0}</span>
                                        <span className="score-total">/{quizResults?.totalQuestions || attempt?.totalQuestions || 0}</span>
                                    </div>
                                    <div className="percentage">
                                        {quizResults?.percentage || attempt?.percentage ? `${Math.round(quizResults?.percentage || attempt?.percentage)}%` : '0%'}
                                    </div>
                                </div>
                                <p>Time taken: {attempt?.timeTaken || 0} minutes</p>
                                <p>Completed: {attempt?.completedAt ? new Date(attempt.completedAt).toLocaleString() : new Date().toLocaleString()}</p>
                            </div>

                            <div className="result-details">
                                <h3>Question Review</h3>
                                {questionResults.map((result, index) => (
                                    <div key={index} className={`question-result ${result.correct ? 'correct' : 'incorrect'}`}>
                                        <h4>Question {index + 1}: {result.question}</h4>
                                        <p><strong>Your answer:</strong> {result.userAnswer}</p>
                                        {!result.correct && (
                                            <p><strong>Correct answer:</strong> {result.correctAnswer}</p>
                                        )}
                                        <span className={`result-badge ${result.correct ? 'correct' : 'incorrect'}`}>
                                            {result.correct ? '✓ Correct' : '✗ Incorrect'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary" onClick={handleBack}>
                                Back to Home
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="page-container">
            <StudentNavbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>{quiz.title}</h1>
                    <div className="quiz-timer">
                        Time Left: <span className={timeLeft < 300 ? 'time-warning' : ''}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </header>

                <main className="dashboard-content">
                    <div className="quiz-container">
                        <div className="quiz-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                        </div>

                        <div className="question-card">
                            <h3>{currentQ.question}</h3>

                            <div className="options">
                                {currentQ.options.map((option, index) => (
                                    <label key={index} className="option">
                                        <input
                                            type="radio"
                                            name={`question-${currentQ._id}`}
                                            value={option}
                                            checked={answers[currentQ._id] === option}
                                            onChange={() => handleAnswerChange(currentQ._id, option)}
                                        />
                                        <span className="option-text">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="quiz-navigation">
                            <button
                                className="btn-secondary"
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                            >
                                Previous
                            </button>

                            {currentQuestion < quiz.questions.length - 1 ? (
                                <button
                                    className="btn-primary"
                                    onClick={handleNext}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    className="btn-success"
                                    onClick={handleSubmitQuiz}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TakeQuiz;