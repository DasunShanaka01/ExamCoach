import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import Footer from '../components/Footer';

const AIQuizGenerator = () => {
    const navigate = useNavigate();

    // View State: 'generator' or 'history'
    const [view, setView] = useState('generator');
    const [history, setHistory] = useState([]);

    // Modal States
    const [viewingNote, setViewingNote] = useState(null); // Content of note being viewed
    const [viewingPdf, setViewingPdf] = useState(null); // URL of PDF being viewed
    const [viewingQuiz, setViewingQuiz] = useState(null); // Full quiz result object being viewed

    // Steps: 'upload', 'quiz', 'result'
    const [step, setStep] = useState('upload');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Input State
    const [textInput, setTextInput] = useState('');
    const [file, setFile] = useState(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState('Normal');

    // Quiz State
    const [quizData, setQuizData] = useState([]);
    const [sourceText, setSourceText] = useState(''); // Store extracted text
    const [pdfUrl, setPdfUrl] = useState(null); // Store Uploaded PDF URL
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(0);

    // Fetch History
    useEffect(() => {
        if (view === 'history') {
            fetchHistory();
        }
    }, [view]);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/quiz/history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain')) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please upload a valid PDF or Text file.');
        }
    };

    const generateQuiz = async () => {
        if (!textInput && !file) {
            setError('Please provide text or upload a file.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        if (file) formData.append('file', file);
        if (textInput) formData.append('textInput', textInput);
        formData.append('numQuestions', numQuestions);
        formData.append('difficulty', difficulty);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/quiz/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setQuizData(data.data);
                setSourceText(data.sourceContent || textInput);
                setPdfUrl(data.pdfUrl || null);
                setStep('quiz');
                setUserAnswers({});
            } else {
                setError(data.error || 'Failed to generate quiz');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, option) => {
        setUserAnswers({
            ...userAnswers,
            [questionIndex]: option
        });
    };

    const submitQuiz = async () => {
        let calculatedScore = 0;
        const questionsWithUserAnswers = quizData.map((question, index) => {
            const isCorrect = userAnswers[index] === question.correctAnswer;
            if (isCorrect) calculatedScore++;
            return {
                ...question,
                userAnswer: userAnswers[index]
            };
        });

        setScore(calculatedScore);
        setStep('result');

        // Save Result to DB
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/quiz/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    score: calculatedScore,
                    totalQuestions: quizData.length,
                    difficulty,
                    questions: questionsWithUserAnswers,
                    sourceContent: sourceText,
                    pdfUrl: pdfUrl
                })
            });
            // Refresh history in background
            fetchHistory();
        } catch (err) {
            console.error("Failed to save quiz result", err);
        }
    };

    const resetQuiz = () => {
        setStep('upload');
        setFile(null);
        setTextInput('');
        setQuizData([]);
        setSourceText('');
        setPdfUrl(null);
        setUserAnswers({});
        setScore(0);
        setError('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            <StudentNavbar />

            <div className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white text-center">
                        <h1 className="text-3xl font-bold mb-2">✨ AI Quiz Generator</h1>
                        <p className="text-white/80">Transform your notes into interactive quizzes instantly</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setView('generator')}
                            className={`flex-1 py-4 text-center font-semibold transition-colors ${view === 'generator'
                                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            📝 Generate Quiz
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className={`flex-1 py-4 text-center font-semibold transition-colors ${view === 'history'
                                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            📜 Quiz History
                        </button>
                    </div>

                    <div className="p-8">
                        {view === 'generator' ? (
                            <>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-violet-600 mx-auto mb-4"></div>
                                        <h3 className="text-xl font-semibold text-gray-800">Generating Your Quiz...</h3>
                                        <p className="text-gray-500">Analysing your notes and crafting questions</p>
                                    </div>
                                ) : (
                                    <>
                                        {error && (
                                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {error}
                                            </div>
                                        )}

                                        {/* STEP 1: UPLOAD */}
                                        {step === 'upload' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="space-y-4">
                                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                        1. Upload Content
                                                    </label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-violet-500 transition-colors bg-gray-50">
                                                            <input
                                                                type="file"
                                                                id="file-upload"
                                                                className="hidden"
                                                                accept=".pdf,.txt"
                                                                onChange={handleFileChange}
                                                            />
                                                            <label htmlFor="file-upload" className="cursor-pointer block h-full flex flex-col items-center justify-center">
                                                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                </svg>
                                                                <span className="text-gray-600 font-medium">{file ? file.name : "Upload PDF or Text File"}</span>
                                                                <span className="text-xs text-gray-400 mt-2">Max 10MB</span>
                                                            </label>
                                                        </div>
                                                        <div className="relative">
                                                            <textarea
                                                                className="w-full h-full min-h-[150px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none bg-gray-50"
                                                                placeholder="Or paste your notes here..."
                                                                value={textInput}
                                                                onChange={(e) => setTextInput(e.target.value)}
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                        2. Quiz Settings
                                                    </label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-2">Number of Questions</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="20"
                                                                value={numQuestions}
                                                                onChange={(e) => setNumQuestions(e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-2">Difficulty Level</label>
                                                            <select
                                                                value={difficulty}
                                                                onChange={(e) => setDifficulty(e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                                            >
                                                                <option value="Easy">Easy</option>
                                                                <option value="Normal">Normal</option>
                                                                <option value="Hard">Hard</option>
                                                                <option value="Expert">Expert</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={generateQuiz}
                                                    disabled={(!file && !textInput) || loading}
                                                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-indigo-700 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Generate Quiz 🚀
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP 2: TAKE QUIZ */}
                                        {step === 'quiz' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="flex justify-between items-center bg-violet-50 p-4 rounded-lg">
                                                    <span className="font-semibold text-violet-700">Question {Object.keys(userAnswers).length} / {quizData.length} Answered</span>
                                                    <span className="text-sm font-bold bg-white px-3 py-1 rounded shadow-sm text-gray-600">{difficulty}</span>
                                                </div>
                                                <div className="space-y-6">
                                                    {quizData.map((q, index) => (
                                                        <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-violet-200 transition-colors">
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                                <span className="text-violet-600 mr-2">{index + 1}.</span>
                                                                {q.question}
                                                            </h3>
                                                            <div className="space-y-3">
                                                                {q.options.map((option, optIndex) => (
                                                                    <label
                                                                        key={optIndex}
                                                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${userAnswers[index] === option
                                                                            ? 'bg-violet-50 border-violet-500 shadow-sm'
                                                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name={`question-${index}`}
                                                                            value={option}
                                                                            checked={userAnswers[index] === option}
                                                                            onChange={() => handleAnswerSelect(index, option)}
                                                                            className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                                                                        />
                                                                        <span className="ml-3 text-gray-700">{option}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={submitQuiz}
                                                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:-translate-y-1"
                                                >
                                                    Submit Answers 📝
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP 3: RESULTS */}
                                        {step === 'result' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="text-center bg-violet-50 rounded-xl p-8 border border-violet-100">
                                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed! 🎉</h2>
                                                    <p className="text-gray-600">Result and notes saved to your history.</p>

                                                    <div className="mt-6 flex justify-center items-center gap-4">
                                                        <div className="text-center">
                                                            <span className="block text-4xl font-extrabold text-violet-600">{score}</span>
                                                            <span className="text-sm text-gray-500 uppercase font-semibold">Correct</span>
                                                        </div>
                                                        <div className="h-12 w-px bg-gray-300"></div>
                                                        <div className="text-center">
                                                            <span className="block text-4xl font-extrabold text-gray-400">{quizData.length}</span>
                                                            <span className="text-sm text-gray-500 uppercase font-semibold">Total</span>
                                                        </div>
                                                        <div className="h-12 w-px bg-gray-300"></div>
                                                        <div className="text-center">
                                                            <span className={`block text-4xl font-extrabold ${score / quizData.length >= 0.7 ? 'text-green-500' : 'text-orange-500'}`}>
                                                                {Math.round((score / quizData.length) * 100)}%
                                                            </span>
                                                            <span className="text-sm text-gray-500 uppercase font-semibold">Score</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-xl font-bold text-gray-800">Review Answers</h3>
                                                    {quizData.map((q, index) => (
                                                        <div key={index} className={`p-6 rounded-xl border-l-4 ${userAnswers[index] === q.correctAnswer
                                                            ? 'bg-green-50 border-green-500'
                                                            : 'bg-red-50 border-red-500'
                                                            }`}>
                                                            <p className="font-semibold text-gray-900 mb-3">
                                                                {index + 1}. {q.question}
                                                            </p>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                <div className={`p-3 rounded-lg ${userAnswers[index] === q.correctAnswer
                                                                    ? 'bg-green-100 text-green-800 font-medium'
                                                                    : 'bg-red-100 text-red-800 line-through'
                                                                    }`}>
                                                                    Your Answer: {userAnswers[index] || 'Skipped'}
                                                                </div>
                                                                <div className="p-3 rounded-lg bg-green-100 text-green-800 font-medium border border-green-200">
                                                                    Correct Answer: {q.correctAnswer}
                                                                </div>
                                                            </div>

                                                            {q.explanation && (
                                                                <div className="mt-2 text-sm text-gray-600 bg-white bg-opacity-50 p-3 rounded-lg">
                                                                    <strong>💡 Explanation:</strong> {q.explanation}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={resetQuiz}
                                                    className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1"
                                                >
                                                    Generate New Quiz 🔄
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            /* HISTORY VIEW */
                            <div className="space-y-6 animate-fade-in relative">
                                {history.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 text-lg">No quizzes taken yet. Go generate one!</p>
                                        <button
                                            onClick={() => setView('generator')}
                                            className="mt-4 text-violet-600 hover:text-violet-700 font-semibold"
                                        >
                                            Create Quiz Now &rarr;
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                                    <th className="p-4 rounded-tl-lg">Date</th>
                                                    <th className="p-4">Difficulty</th>
                                                    <th className="p-4">Score</th>
                                                    <th className="p-4 text-center">Percentage</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 rounded-tr-lg text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {history.map((item) => {
                                                    const percentage = Math.round((item.score / item.totalQuestions) * 100);
                                                    return (
                                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-4 text-gray-800 font-medium">
                                                                {formatDate(item.createdAt)}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.difficulty === 'Expert' ? 'bg-red-100 text-red-700' :
                                                                    item.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                                                                        item.difficulty === 'Normal' ? 'bg-blue-100 text-blue-700' :
                                                                            'bg-green-100 text-green-700'
                                                                    }`}>
                                                                    {item.difficulty}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-gray-700">
                                                                {item.score} / {item.totalQuestions}
                                                            </td>
                                                            <td className="p-4 text-center font-bold text-gray-700">
                                                                {percentage}%
                                                            </td>
                                                            <td className="p-4">
                                                                {percentage >= 70 ? (
                                                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                        Passed
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-500 font-bold flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        Failed
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-right space-x-2">
                                                                {item.pdfUrl && (
                                                                    <button
                                                                        onClick={() => setViewingPdf(item.pdfUrl)}
                                                                        className="text-violet-600 hover:text-violet-800 font-medium text-sm underline mr-2"
                                                                    >
                                                                        PDF
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setViewingNote(item.sourceContent || "No notes available for this quiz.")}
                                                                    className="text-gray-500 hover:text-gray-700 font-medium text-sm underline mr-2"
                                                                >
                                                                    Text
                                                                </button>
                                                                <button
                                                                    onClick={() => setViewingQuiz(item)}
                                                                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm underline"
                                                                >
                                                                    Results
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Note Viewer Modal */}
            {viewingNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-900">Studied Notes</h3>
                            <button
                                onClick={() => setViewingNote(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
                                {viewingNote}
                            </pre>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setViewingNote(null)}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {viewingPdf && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-900">Original PDF</h3>
                            <div className="flex gap-4">
                                <a href={viewingPdf} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-medium">Download / Open in New Tab</a>
                                <button
                                    onClick={() => setViewingPdf(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 relative">
                            <iframe
                                src={viewingPdf}
                                className="w-full h-full border-0"
                                title="PDF Viewer"
                            ></iframe>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setViewingPdf(null)}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Result Viewer Modal */}
            {viewingQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-violet-50 rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Quiz Results</h3>
                                <p className="text-sm text-gray-500">{formatDate(viewingQuiz.createdAt)} • {viewingQuiz.difficulty}</p>
                            </div>
                            <button
                                onClick={() => setViewingQuiz(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            {/* Score Summary */}
                            <div className="flex justify-center items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm">
                                <div className="text-center">
                                    <span className="block text-3xl font-extrabold text-violet-600">{viewingQuiz.score}</span>
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Correct</span>
                                </div>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <div className="text-center">
                                    <span className="block text-3xl font-extrabold text-gray-400">{viewingQuiz.totalQuestions}</span>
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Total</span>
                                </div>
                                <div className="h-8 w-px bg-gray-300"></div>
                                <div className="text-center">
                                    <span className={`block text-3xl font-extrabold ${viewingQuiz.score / viewingQuiz.totalQuestions >= 0.7 ? 'text-green-500' : 'text-orange-500'}`}>
                                        {Math.round((viewingQuiz.score / viewingQuiz.totalQuestions) * 100)}%
                                    </span>
                                    <span className="text-xs text-gray-500 uppercase font-semibold">Score</span>
                                </div>
                            </div>

                            {/* Questions Review */}
                            <div className="space-y-6">
                                {viewingQuiz.questions && viewingQuiz.questions.map((q, index) => (
                                    <div key={index} className={`p-6 rounded-xl border-l-4 bg-white shadow-sm ${q.userAnswer === q.correctAnswer
                                        ? 'border-green-500'
                                        : 'border-red-500'
                                        }`}>
                                        <p className="font-semibold text-gray-900 mb-3">
                                            {index + 1}. {q.question}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className={`p-3 rounded-lg ${q.userAnswer === q.correctAnswer
                                                ? 'bg-green-50 text-green-800 font-medium'
                                                : 'bg-red-50 text-red-800 line-through'
                                                }`}>
                                                Your Answer: {q.userAnswer || 'Skipped'}
                                            </div>
                                            <div className="p-3 rounded-lg bg-green-50 text-green-800 font-medium border border-green-200">
                                                Correct Answer: {q.correctAnswer}
                                            </div>
                                        </div>

                                        {q.explanation && (
                                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                <strong>💡 Explanation:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setViewingQuiz(null)}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                            >
                                Close Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AIQuizGenerator;
