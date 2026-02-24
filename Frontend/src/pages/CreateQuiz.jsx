import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { quizAPI } from '../services/api';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        timeLimit: 30,
        maxAttempts: 1,
        enrollmentKey: '',
        quizPassword: '',
        enrollmentStartTime: '',
        enrollmentEndTime: '',
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
            setCurrentQuestion({ ...currentQuestion, options: newOptions });
        } else {
            setCurrentQuestion({ ...currentQuestion, [name]: value });
        }
    };

    const addQuestion = () => {
        if (currentQuestion.question && currentQuestion.options.every(opt => opt.trim())) {
            setFormData({
                ...formData,
                questions: [...formData.questions, currentQuestion]
            });
            setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
        } else {
            alert('Please fill all question fields');
        }
    };

    const removeQuestion = (index) => {
        setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.questions.length === 0) { alert('Please add at least one question'); return; }
        setLoading(true);
        try {
            // Convert datetime-local strings (local time, no tz) → UTC ISO so MongoDB
            // stores the time the teacher actually intended, not a UTC-shifted version.
            const payload = { ...formData };
            if (payload.enrollmentStartTime)
                payload.enrollmentStartTime = new Date(payload.enrollmentStartTime).toISOString();
            if (payload.enrollmentEndTime)
                payload.enrollmentEndTime = new Date(payload.enrollmentEndTime).toISOString();
            const data = await quizAPI.createQuiz(payload);
            if (data.success) { alert('Quiz created successfully!'); navigate('/teacher/view-quizzes'); }
            else { alert(data.error || 'Quiz creation failed'); }
        } catch (error) { alert('Quiz creation failed: ' + error.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role="teacher" />
            <div className="flex-1 ml-64">
                <TopNavbar role="teacher" pageName="Create Quiz" />
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Create Quiz</h1>
                            <p className="text-gray-600 mt-1">Fill in the details and add questions to create a new quiz.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Quiz Details */}
                            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Quiz Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Enter quiz title" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                        <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Enter subject" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y" rows="3" placeholder="Enter quiz description" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                                        <input type="number" value={formData.timeLimit} onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" min="1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts *</label>
                                        <input type="number" value={formData.maxAttempts} onChange={(e) => setFormData({...formData, maxAttempts: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" min="1" required />
                                        <p className="text-xs text-gray-400 mt-1">Number of times a student can attempt this quiz</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Key *</label>
                                        <input type="text" value={formData.enrollmentKey} onChange={(e) => setFormData({...formData, enrollmentKey: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="e.g. QUIZ-2026-001" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Password *</label>
                                        <input type="text" value={formData.quizPassword} onChange={(e) => setFormData({...formData, quizPassword: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Password for students" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Start *</label>
                                        <input type="datetime-local" value={formData.enrollmentStartTime} onChange={(e) => setFormData({...formData, enrollmentStartTime: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment End *</label>
                                        <input type="datetime-local" value={formData.enrollmentEndTime} onChange={(e) => setFormData({...formData, enrollmentEndTime: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required />
                                    </div>
                                </div>
                            </div>

                            {/* Add Question */}
                            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Add Question</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                                    <input type="text" name="question" value={currentQuestion.question} onChange={handleQuestionChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Enter the question" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQuestion.options.map((option, index) => (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Option {index + 1} *</label>
                                            <input type="text" name={`option-${index}`} value={option} onChange={handleQuestionChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder={`Option ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                        <select name="correctAnswer" value={currentQuestion.correctAnswer} onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white">
                                            {currentQuestion.options.map((_, index) => (
                                                <option key={index} value={index}>Option {index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
                                        <input type="text" name="explanation" value={currentQuestion.explanation} onChange={handleQuestionChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Why is this correct?" />
                                    </div>
                                </div>
                                <button type="button" onClick={addQuestion} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    + Add Question
                                </button>
                            </div>

                            {/* Questions List */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">Questions ({formData.questions.length})</h2>
                                {formData.questions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-6">No questions added yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.questions.map((q, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800"><span className="text-blue-600 mr-2">Q{index + 1}.</span>{q.question}</p>
                                                    <ul className="mt-2 space-y-1">
                                                        {q.options.map((opt, i) => (
                                                            <li key={i} className={`text-sm pl-4 ${i === q.correctAnswer ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                                                {i === q.correctAnswer ? '✓' : '○'} {opt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <button type="button" onClick={() => removeQuestion(index)} className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => navigate('/teacher/dashboard')} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Cancel</button>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300 disabled:cursor-not-allowed">
                                    {loading ? 'Creating Quiz...' : 'Create Quiz'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuiz;
