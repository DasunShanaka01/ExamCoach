import React, { useState, useEffect } from 'react';
import { Upload, FileText, Save, Clock, RefreshCw, File, Loader2, Trash2, Search, Sparkles, BookOpen } from 'lucide-react';

const AILearningLab = () => {
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'text'
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState('');
    const [currentTitle, setCurrentTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [relatedResources, setRelatedResources] = useState([]);
    const [activeResultTab, setActiveResultTab] = useState('summary'); // 'summary', 'resources'
    const [deletingHistoryId, setDeletingHistoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [summaryType, setSummaryType] = useState('paragraph');

    const normalizeRelatedResources = (resources) => {
        if (!resources) return [];

        let parsedResources = resources;
        if (typeof parsedResources === 'string') {
            try {
                parsedResources = JSON.parse(parsedResources);
            } catch {
                return [];
            }
        }

        if (!Array.isArray(parsedResources)) return [];

        return parsedResources
            .map((resource) => {
                if (!resource) return null;

                const title = String(resource.title || resource.name || '').trim();
                const link = String(resource.link || resource.url || '').trim();
                const rawType = String(resource.type || '').toLowerCase();

                if (!title || !link) return null;

                let type = 'other';
                if (rawType === 'youtube' || /youtube\.com|youtu\.be/i.test(link)) {
                    type = 'youtube';
                } else if (rawType === 'website') {
                    type = 'website';
                }

                return { title, link, type };
            })
            .filter(Boolean);
    };

    const summaryTypeOptions = [
        {
            value: 'paragraph',
            label: 'Paragraph Summary (Executive Summary)',
            description: 'A standard, written paragraph that explains the main ideas in a flowing story format.'
        },
        {
            value: 'qa',
            label: 'Q&A Style (Flashcard Ready)',
            description: 'A list of Questions and Answers based on the most important facts.'
        },
        {
            value: 'glossary',
            label: 'Key Terms & Definitions (Glossary)',
            description: 'Important vocabulary words with simple definitions.'
        },
        {
            value: 'exam',
            label: '"Exam Focus" Summary',
            description: 'Highlights formulas, dates, main arguments, or rules most likely to appear on a test.'
        }
    ];

    const selectedSummaryOption = summaryTypeOptions.find((option) => option.value === summaryType);

    const getWordCount = (content) => {
        if (!content || typeof content !== 'string') return 0;
        return content.trim().split(/\s+/).filter(Boolean).length;
    };

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : null;

    useEffect(() => {
        if (userId) {
            fetchHistory();
        }
    }, [userId]);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/ai/history/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSummary('');
        setRelatedResources([]);
        setCurrentTitle('');
        setSelectedHistoryId(null);
        setActiveResultTab('summary');
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleSummarize = async () => {
        if (!text.trim() && !file) {
            setError('Please enter text or upload a PDF to summarize.');
            return;
        }

        setLoading(true);
        setError(null);
        setSummary('');
        setRelatedResources([]);
        setSelectedHistoryId(null);
        setActiveResultTab('summary');

        const formData = new FormData();
        if (activeTab === 'text' && text) {
            formData.append('text', text);
            setCurrentTitle(text.substring(0, 30) + (text.length > 30 ? '...' : ''));
        } else if (activeTab === 'upload' && file) {
            formData.append('file', file);
            setCurrentTitle(file.name);
        }
        formData.append('summaryType', summaryType);

        try {
            // Note: Ensure backend allows just file or just text
            const response = await fetch('http://localhost:5000/api/ai/summarize', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to summarize text');
            }

            setSummary(data.summary || '');

            const normalizedResources =
                normalizeRelatedResources(data.relatedResources).length > 0
                    ? normalizeRelatedResources(data.relatedResources)
                    : normalizeRelatedResources(data.resources);

            setRelatedResources(normalizedResources);
            if (data.relatedResources && data.relatedResources.length > 0) {
                // specific logic if needed, but we start at summary tab
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!summary) return;

        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('title', currentTitle || 'New Summary');
            formData.append('summary', summary);
            formData.append('relatedResources', JSON.stringify(relatedResources));
            formData.append('type', activeTab === 'upload' ? 'pdf' : 'text');

            if (activeTab === 'text') {
                formData.append('originalText', text);
            } else if (file) {
                formData.append('file', file);
            }

            const response = await fetch('http://localhost:5000/api/ai/save', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                fetchHistory(); // Refresh list
                alert('Summary saved!');
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            console.error(err);
            setError("Failed to save summary.");
        }
    };

    const loadHistoryItem = (item) => {
        setSelectedHistoryId(item._id);
        setSummary(item.summary);
        setRelatedResources(normalizeRelatedResources(item.relatedResources));
        setCurrentTitle(item.title);
        setActiveResultTab('summary');
        setActiveTab(item.type === 'pdf' ? 'upload' : 'text');
        if (item.type === 'text') {
            setText(item.originalContent);
            setFile(null);
        } else {
            // For PDF, simply show upload tab state, but we can't set file input value programmatically
            setText('');
            setFile(null);
        }
    };

    const handleDeleteHistoryItem = async (e, itemId) => {
        e.stopPropagation();

        if (!userId || deletingHistoryId === itemId) return;

        const confirmed = window.confirm('Delete this saved note from history?');
        if (!confirmed) return;

        try {
            setDeletingHistoryId(itemId);
            setError(null);

            const response = await fetch(`http://localhost:5000/api/ai/history/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to delete history item');
            }

            if (selectedHistoryId === itemId) {
                setSelectedHistoryId(null);
                setSummary('');
                setRelatedResources([]);
                setCurrentTitle('');
                setText('');
                setFile(null);
                setActiveResultTab('summary');
            }

            setHistory((prev) => prev.filter((item) => item._id !== itemId));
        } catch (err) {
            setError(err.message || 'Failed to delete history item.');
        } finally {
            setDeletingHistoryId(null);
        }
    };

    const filteredHistory = history.filter((item) => {
        if (!searchTerm.trim()) return true;
        return String(item.title || '')
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());
    });

    return (
        <div className="relative min-h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-['Manrope',sans-serif]">
            <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"></div>
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl"></div>

            {/* Header */}
            <div className="px-8 pt-8 pb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 text-blue-600">
                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-['DM_Serif_Display',serif] text-slate-900">AI Learning Lab</h1>
                            <p className="text-sm text-slate-500">Use the power of AI to summarize your study materials and enhance your learning.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <Clock size={16} className="text-slate-500" />
                                    History (My Notes)
                                </h2>
                                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{history.length}</span>
                            </div>

                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search summaries..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            <div className="text-xs uppercase tracking-wide text-slate-400 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                My Notes
                            </div>

                            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                {filteredHistory.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        No history yet.
                                    </div>
                                ) : (
                                    filteredHistory.map(item => (
                                        <div
                                            key={item._id}
                                            onClick={() => loadHistoryItem(item)}
                                            className={`group p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${selectedHistoryId === item._id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200/60 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 p-2 rounded-xl ${item.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    {item.type === 'pdf' ? <FileText size={16} /> : <File size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`text-sm font-medium truncate ${selectedHistoryId === item._id ? 'text-blue-700' : 'text-slate-700'}`}>{item.title}</h4>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDeleteHistoryItem(e, item._id)}
                                                            disabled={deletingHistoryId === item._id}
                                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-40"
                                                            title="Delete note"
                                                        >
                                                            {deletingHistoryId === item._id ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <Trash2 size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                        <span>{getWordCount(item.summary)} Words</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input Card */}
                            <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <BookOpen size={18} className="text-blue-600" />
                                            Generate Summary
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">Upload your study materials and let our AI generate concise summaries.</p>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-slate-100 bg-slate-50/60">
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}`}
                                    >
                                        <Upload size={16} /> Upload PDF
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('text')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'text' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}`}
                                    >
                                        <FileText size={16} /> Paste Text
                                    </button>
                                </div>

                                <div className="p-6 flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Summary Type</label>
                                        <div className="mt-2">
                                            <select
                                                value={summaryType}
                                                onChange={(e) => setSummaryType(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            >
                                                {summaryTypeOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {activeTab === 'upload' ? (
                                        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/40 hover:bg-white hover:border-blue-300 transition-all">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                                                <Upload className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 mb-1">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-400 mb-5">PDF files only (max 10MB)</p>

                                            <input
                                                type="file"
                                                id="file-upload"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
                                            >
                                                Choose File
                                            </label>
                                            {file && (
                                                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                                    <File size={14} />
                                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <textarea
                                            className="w-full min-h-[260px] p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-transparent resize-none bg-slate-50 focus:bg-white transition-colors text-sm"
                                            placeholder="Paste your lecture notes or text here..."
                                            value={text}
                                            onChange={handleTextChange}
                                        ></textarea>
                                    )}

                                    {error && <p className="text-rose-500 text-sm text-center bg-rose-50 py-2 rounded-xl">{error}</p>}

                                    <button
                                        onClick={handleSummarize}
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                                        {loading ? 'Analyzing Content...' : 'Generate New Summary'}
                                    </button>
                                </div>
                            </div>

                            {/* Output Card */}
                            <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">AI Summary Preview</h3>
                                        <p className="text-xs text-slate-500 mt-1">AI Generated • {new Date().toLocaleDateString()}</p>
                                        {selectedSummaryOption && (
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                                                    {selectedSummaryOption.label}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {selectedSummaryOption.description}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleSave} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors shadow-sm">
                                        <Save size={14} /> Save Note
                                    </button>
                                </div>

                                {/* Result Tabs */}
                                <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
                                    <button
                                        onClick={() => setActiveResultTab('summary')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeResultTab === 'summary' ? 'border-amber-400 text-amber-800 bg-amber-50/60' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Summary
                                    </button>
                                    <button
                                        onClick={() => setActiveResultTab('resources')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeResultTab === 'resources' ? 'border-blue-400 text-blue-700 bg-blue-50/60' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        Related Resources
                                    </button>
                                </div>

                                <div className="relative flex-1 p-6 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
                                    {loading ? (
                                        <div className="space-y-4 animate-pulse">
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                                        </div>
                                    ) : !summary ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center py-14 text-slate-400">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                                <FileText size={28} className="text-slate-300" />
                                            </div>
                                            <h3 className="text-base font-semibold text-slate-600 mb-1">Ready to Summarize</h3>
                                            <p className="max-w-xs text-sm">Upload a document or paste text to see the AI-generated summary here.</p>
                                        </div>
                                    ) : (
                                        activeResultTab === 'summary' ? (
                                            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed p-5 bg-white rounded-2xl border border-amber-100 shadow-sm relative whitespace-pre-line">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-t-2xl"></div>
                                                <span className="absolute -top-3 left-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                    AI Summary
                                                </span>
                                                {summary}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {relatedResources.length > 0 ? (
                                                    relatedResources.map((resource, index) => (
                                                        <div key={index} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`p-2 rounded-xl ${resource.type === 'youtube' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                    {resource.type === 'youtube' ? (
                                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                                    ) : (
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-slate-900 mb-1">{resource.title}</h4>
                                                                    <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                                        View Resource <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-slate-500">
                                                        No related resources found.
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AILearningLab;
