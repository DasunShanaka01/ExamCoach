import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { quizAPI } from '../services/api';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        timeLimit: 30,
        questions: []
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
    });
    const [loading, setLoading] = useState(false);

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('option')) {
            const index = parseInt(name.split('-')[1]);
            const newOptions = [...currentQuestion.options];
            newOptions[index] = value;
            setCurrentQuestion({
                ...currentQuestion,
                options: newOptions
            });
        } else {
            setCurrentQuestion({
                ...currentQuestion,
                [name]: value
            });
        }
    };

    const addQuestion = () => {
        if (currentQuestion.question && currentQuestion.options.every(opt => opt.trim())) {
            setFormData({
                ...formData,
                questions: [...formData.questions, currentQuestion]
            });
            setCurrentQuestion({
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: ''
            });
        } else {
            alert('Please fill all question fields');
        }
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            questions: newQuestions
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        setLoading(true);

        try {
            const data = await quizAPI.createQuiz(formData);

            if (data.success) {
                alert('Quiz created successfully!');
                navigate('/teacher/dashboard');
            } else {
                alert(data.error || 'Quiz creation failed');
            }
        } catch (error) {
            alert('Quiz creation failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="layout-container">
            <Sidebar role="teacher" />
            <div className="main-content">
                <div className="form-container">
                    <h2>Create Quiz</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Time Limit (minutes)</label>
                            <input
                                type="number"
                                name="timeLimit"
                                value={formData.timeLimit}
                                onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                                min="1"
                            />
                        </div>

                        <div className="question-builder">
                            <h3>Add Question</h3>
                            <div className="form-group">
                                <label>Question</label>
                                <input
                                    type="text"
                                    name="question"
                                    value={currentQuestion.question}
                                    onChange={handleQuestionChange}
                                />
                            </div>
                            
                            {currentQuestion.options.map((option, index) => (
                                <div key={index} className="form-group">
                                    <label>Option {index + 1}</label>
                                    <input
                                        type="text"
                                        name={`option-${index}`}
                                        value={option}
                                        onChange={handleQuestionChange}
                                    />
                                </div>
                            ))}
                            
                            <div className="form-group">
                                <label>Correct Answer</label>
                                <select
                                    name="correctAnswer"
                                    value={currentQuestion.correctAnswer}
                                    onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: parseInt(e.target.value)})}
                                >
                                    {currentQuestion.options.map((_, index) => (
                                        <option key={index} value={index}>Option {index + 1}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Explanation (optional)</label>
                                <textarea
                                    name="explanation"
                                    value={currentQuestion.explanation}
                                    onChange={handleQuestionChange}
                                />
                            </div>
                            
                            <button type="button" onClick={addQuestion}>Add Question</button>
                        </div>

                        <div className="questions-list">
                            <h3>Questions ({formData.questions.length})</h3>
                            {formData.questions.map((q, index) => (
                                <div key={index} className="question-item">
                                    <p><strong>{q.question}</strong></p>
                                    <ul>
                                        {q.options.map((opt, i) => (
                                            <li key={i} className={i === q.correctAnswer ? 'correct' : ''}>
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                    <button type="button" onClick={() => removeQuestion(index)}>Remove</button>
                                </div>
                            ))}
                        </div>
                        
                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating Quiz...' : 'Create Quiz'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateQuiz;