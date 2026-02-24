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
    const [viewingNote, setViewingNote] = useState(null);
    const [viewingPdf, setViewingPdf] = useState(null);
    const [viewingQuiz, setViewingQuiz] = useState(null);

    // Steps: 'upload', 'quiz', 'result'
    const [step, setStep] = useState('upload');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Input State
    const [textInput, setTextInput] = useState('');
    const [file, setFile] = useState(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState('Normal');
    const [language, setLanguage] = useState('English');

    // NEW: Question Types State
    const [selectedTypes, setSelectedTypes] = useState(['MCQ']);

    // Quiz State
    const [quizData, setQuizData] = useState([]);
    const [sourceText, setSourceText] = useState('');
    const [pdfUrl, setPdfUrl] = useState(null);
    const [userAnswers, setUserAnswers] = useState({}); // Object: keys are indices, values can be string or array
    const [score, setScore] = useState(0);

    const questionTypes = [
        { id: 'MCQ', label: 'Multiple Choice (MCQ)' },
        { id: 'TrueFalse', label: 'True / False' },
        { id: 'MultiSelect', label: 'Multiple Response' },
        { id: 'FillBlanks', label: 'Fill-in-the-Blanks' },
        { id: 'ShortAnswer', label: 'Very Short Answer' },
        { id: 'Essay', label: 'Essay Questions' }
    ];

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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setHistory(data.data);
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

    const handleTypeToggle = (typeId) => {
        if (selectedTypes.includes(typeId)) {
            // Prevent unselecting the last one
            if (selectedTypes.length > 1) {
                setSelectedTypes(selectedTypes.filter(t => t !== typeId));
            }
        } else {
            setSelectedTypes([...selectedTypes, typeId]);
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
        formData.append('language', language);
        // Append types as JSON string or individual fields? Express handles array if same key.
        // It's safer to pass consistent JSON payload via FormData, but FormData handles arrays by appending multiple times.
        selectedTypes.forEach(type => formData.append('selectedTypes', type));

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/quiz/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
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

    const handleAnswerChange = (questionIndex, value, type) => {
        if (type === 'MultiSelect') {
            // Value is the option toggled
            const current = userAnswers[questionIndex] || [];
            let newAnswers;
            if (current.includes(value)) {
                newAnswers = current.filter(item => item !== value);
            } else {
                newAnswers = [...current, value];
            }
            setUserAnswers({ ...userAnswers, [questionIndex]: newAnswers });
        } else {
            // For MCQ, Text, etc.
            setUserAnswers({ ...userAnswers, [questionIndex]: value });
        }
    };

    const submitQuiz = async () => {
        let calculatedScore = 0;

        const questionsWithUserAnswers = quizData.map((question, index) => {
            const uAns = userAnswers[index];
            let isCorrect = false;

            if (question.type === 'MultiSelect') {
                const cAns = question.correctAnswer || []; // Array
                const uAnsArr = uAns || [];
                // Check exact match of arrays (order independent)
                if (Array.isArray(cAns) && Array.isArray(uAnsArr)) {
                    isCorrect = cAns.length === uAnsArr.length && cAns.every(val => uAnsArr.includes(val));
                }
            } else if (question.type === 'FillBlanks' || question.type === 'ShortAnswer') {
                const cAns = question.correctAnswer || "";
                const uAnsStr = uAns || "";
                // Simple case-insensitive match
                isCorrect = uAnsStr.trim().toLowerCase() === cAns.trim().toLowerCase();
            } else if (question.type === 'Essay') {
                // Essay logic: Mark correct if non-empty? Or exclude from auto-score?
                // For now, we'll mark it as 'Manual Review' -> 0 score but allow saving.
                // Or give full marks if > 10 chars.
                isCorrect = (uAns && uAns.length > 10);
            } else {
                // MCQ, TrueFalse
                isCorrect = uAns === question.correctAnswer;
            }

            if (isCorrect) calculatedScore++;

            return {
                ...question,
                userAnswer: uAns,
                obtainedMarks: isCorrect ? 1 : 0
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
        setSelectedTypes(['MCQ']);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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
                        <p className="text-white/80">Transform your notes into mixed-type assessments</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button onClick={() => setView('generator')} className={`flex-1 py-4 text-center font-semibold transition-colors ${view === 'generator' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>📝 Generate Quiz</button>
                        <button onClick={() => setView('history')} className={`flex-1 py-4 text-center font-semibold transition-colors ${view === 'history' ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>📜 Quiz History</button>
                    </div>

                    <div className="p-8">
                        {view === 'generator' ? (
                            <>
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-violet-600 mx-auto mb-4"></div>
                                        <h3 className="text-xl font-semibold text-gray-800">Creating Your Quiz...</h3>
                                        <p className="text-gray-500">Generating questions based on selected types.</p>
                                    </div>
                                ) : (
                                    <>
                                        {error && (
                                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                                {error}
                                            </div>
                                        )}

                                        {step === 'upload' && (
                                            <div className="space-y-8 animate-fade-in">
                                                {/* Upload Section */}
                                                <div className="space-y-4">
                                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">1. Upload Content</label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-violet-500 transition-colors bg-gray-50">
                                                            <input type="file" id="file-upload" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
                                                            <label htmlFor="file-upload" className="cursor-pointer block h-full flex flex-col items-center justify-center">
                                                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                                <span className="text-gray-600 font-medium">{file ? file.name : "Upload PDF or Text File"}</span>
                                                                <span className="text-xs text-gray-400 mt-2">Max 10MB</span>
                                                            </label>
                                                        </div>
                                                        <div className="relative">
                                                            <textarea className="w-full h-full min-h-[150px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none bg-gray-50" placeholder="Or paste your notes here..." value={textInput} onChange={(e) => setTextInput(e.target.value)}></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Settings Section */}
                                                <div className="space-y-4">
                                                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">2. Quiz Settings</label>

                                                    {/* Question Types Selection */}
                                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                        <label className="block text-sm text-gray-600 mb-3 font-semibold">Select Question Types</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                            {questionTypes.map((type) => (
                                                                <label key={type.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedTypes.includes(type.id) ? 'bg-violet-100 border-violet-500' : 'bg-white border-gray-200 hover:bg-gray-100'}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedTypes.includes(type.id)}
                                                                        onChange={() => handleTypeToggle(type.id)}
                                                                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                                                                    />
                                                                    <span className="ml-2 text-sm text-gray-700 font-medium">{type.label}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-2">Total Questions</label>
                                                            <input type="number" min="1" max="20" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-2">Difficulty Level</label>
                                                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                                                                <option value="Easy">Easy</option>
                                                                <option value="Normal">Normal</option>
                                                                <option value="Hard">Hard</option>
                                                                <option value="Expert">Expert</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-2">Language</label>
                                                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                                                                <option value="English">English</option>
                                                                <option value="Sinhala">Sinhala (සිංහල)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button onClick={generateQuiz} disabled={(!file && !textInput) || loading} className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-violet-700 hover:to-indigo-700 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    Generate Quiz 🚀
                                                </button>
                                            </div>
                                        )}

                                        {step === 'quiz' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="flex justify-between items-center bg-violet-50 p-4 rounded-lg">
                                                    <span className="font-semibold text-violet-700">Attempting Quiz</span>
                                                    <span className="text-sm font-bold bg-white px-3 py-1 rounded shadow-sm text-gray-600">{difficulty}</span>
                                                </div>
                                                <div className="space-y-8">
                                                    {quizData.map((q, index) => (
                                                        <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-violet-200 transition-colors">
                                                            <div className="flex items-start gap-3 mb-4">
                                                                <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded uppercase mt-1 whitespace-nowrap">{q.type}</span>
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    <span className="text-violet-600 mr-2">{index + 1}.</span>
                                                                    {q.question}
                                                                </h3>
                                                            </div>

                                                            {/* RENDER INPUT BASED ON TYPE */}
                                                            <div className="space-y-3">
                                                                {/* MCQ & TrueFalse */}
                                                                {(q.type === 'MCQ' || q.type === 'TrueFalse') && q.options.map((option, optIndex) => (
                                                                    <label key={optIndex} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${userAnswers[index] === option ? 'bg-violet-50 border-violet-500 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                                        <input type="radio" name={`question-${index}`} value={option} checked={userAnswers[index] === option} onChange={() => handleAnswerChange(index, option, 'MCQ')} className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500" />
                                                                        <span className="ml-3 text-gray-700">{option}</span>
                                                                    </label>
                                                                ))}

                                                                {/* MultiSelect */}
                                                                {q.type === 'MultiSelect' && q.options.map((option, optIndex) => (
                                                                    <label key={optIndex} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${(userAnswers[index] || []).includes(option) ? 'bg-violet-50 border-violet-500 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                                        <input type="checkbox" checked={(userAnswers[index] || []).includes(option)} onChange={() => handleAnswerChange(index, option, 'MultiSelect')} className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500" />
                                                                        <span className="ml-3 text-gray-700">{option}</span>
                                                                    </label>
                                                                ))}

                                                                {/* FillBlanks & ShortAnswer */}
                                                                {(q.type === 'FillBlanks' || q.type === 'ShortAnswer') && (
                                                                    <input
                                                                        type="text"
                                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                                                                        placeholder="Type your answer here..."
                                                                        value={userAnswers[index] || ''}
                                                                        onChange={(e) => handleAnswerChange(index, e.target.value, 'Text')}
                                                                    />
                                                                )}

                                                                {/* Essay */}
                                                                {q.type === 'Essay' && (
                                                                    <textarea
                                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none min-h-[100px]"
                                                                        placeholder="Write your essay answer here..."
                                                                        value={userAnswers[index] || ''}
                                                                        onChange={(e) => handleAnswerChange(index, e.target.value, 'Text')}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button onClick={submitQuiz} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:-translate-y-1">
                                                    Submit Answers 📝
                                                </button>
                                            </div>
                                        )}

                                        {step === 'result' && (
                                            <div className="space-y-8 animate-fade-in">
                                                <div className="text-center bg-violet-50 rounded-xl p-8 border border-violet-100">
                                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed! 🎉</h2>
                                                    <p className="text-gray-600">Note: Essay/Short answers are auto-graded based on keywords/length.</p>

                                                    <div className="mt-6 flex justify-center items-center gap-4">
                                                        <div className="text-center"><span className="block text-4xl font-extrabold text-violet-600">{score}</span><span className="text-sm text-gray-500 uppercase font-semibold">Correct</span></div>
                                                        <div className="h-12 w-px bg-gray-300"></div>
                                                        <div className="text-center"><span className="block text-4xl font-extrabold text-gray-400">{quizData.length}</span><span className="text-sm text-gray-500 uppercase font-semibold">Total</span></div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-xl font-bold text-gray-800">Review Answers</h3>
                                                    {quizData.map((q, index) => (
                                                        <div key={index} className="p-6 rounded-xl border-l-4 bg-white shadow-sm border-violet-300">
                                                            <div className="flex justify-between">
                                                                <p className="font-semibold text-gray-900 mb-3">{index + 1}. {q.question} <span className="text-xs text-gray-500 bg-gray-100 px-2 rounded ml-2">{q.type}</span></p>
                                                            </div>

                                                            {/* Review Display Logic */}
                                                            <div className="grid grid-cols-1 gap-4 mb-4">
                                                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                                                    <span className="block text-xs font-bold text-gray-500 uppercase">Your Answer</span>
                                                                    <div className="text-gray-900 font-medium">
                                                                        {Array.isArray(userAnswers[index]) ? userAnswers[index].join(', ') : (userAnswers[index] || 'Skipped')}
                                                                    </div>
                                                                </div>
                                                                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                                                    <span className="block text-xs font-bold text-green-700 uppercase">Correct Answer / Model Answer</span>
                                                                    <div className="text-green-900 font-medium">
                                                                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {q.explanation && (
                                                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"><strong>💡 Explanation:</strong> {q.explanation}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <button onClick={resetQuiz} className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1">Generate New Quiz 🔄</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            /* History View - Same as before but handle types logic */
                            <div className="space-y-6 animate-fade-in relative">
                                {history.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 text-lg">No quizzes taken yet.</p>
                                        <button onClick={() => setView('generator')} className="mt-4 text-violet-600 hover:text-violet-700 font-semibold">Create Quiz Now &rarr;</button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                                    <th className="p-4 rounded-tl-lg">Date</th>
                                                    <th className="p-4">Difficulty</th>
                                                    <th className="p-4">Score</th>
                                                    <th className="p-4 rounded-tr-lg text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {history.map((item) => (
                                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-4 text-gray-800 font-medium">{formatDate(item.createdAt)}</td>
                                                        <td className="p-4"><span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">{item.difficulty}</span></td>
                                                        <td className="p-4 text-gray-700">{item.score} / {item.totalQuestions}</td>
                                                        <td className="p-4 text-right space-x-2">
                                                            {item.pdfUrl && <button onClick={() => setViewingPdf(item.pdfUrl)} className="text-violet-600 text-sm underline mr-2">PDF</button>}
                                                            <button onClick={() => setViewingNote(item.sourceContent || "No notes.")} className="text-gray-500 text-sm underline mr-2">Text</button>
                                                            <button onClick={() => setViewingQuiz(item)} className="text-indigo-600 text-sm underline">Results</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals for Note, PDF, and Results remain similar but logic inside result modal updated to handle mixed types */}
            {viewingNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6">
                        <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Notes</h3><button onClick={() => setViewingNote(null)}>✕</button></div>
                        <div className="overflow-y-auto flex-1"><pre className="whitespace-pre-wrap font-sans text-sm">{viewingNote}</pre></div>
                    </div>
                </div>
            )}

            {viewingPdf && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                        <div className="p-4 flex justify-between bg-gray-50 rounded-t-2xl"><h3 className="font-bold">PDF</h3><button onClick={() => setViewingPdf(null)}>✕</button></div>
                        <iframe src={viewingPdf} className="flex-1 w-full" title="PDF"></iframe>
                    </div>
                </div>
            )}

            {viewingQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col p-6">
                        <div className="flex justify-between mb-4 border-b pb-4"><h3 className="text-xl font-bold">Results</h3><button onClick={() => setViewingQuiz(null)}>✕</button></div>
                        <div className="overflow-y-auto flex-1 space-y-6">
                            <div className="text-center mb-6"><span className="text-3xl font-bold text-violet-600">{viewingQuiz.score} / {viewingQuiz.totalQuestions}</span></div>
                            {viewingQuiz.questions && viewingQuiz.questions.map((q, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                    <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                                    <p className="text-sm text-gray-600 mb-1">Your Answer: {Array.isArray(q.userAnswer) ? q.userAnswer.join(', ') : q.userAnswer}</p>
                                    <p className="text-sm text-green-700 font-medium">Correct: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</p>
                                    <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AIQuizGenerator;
