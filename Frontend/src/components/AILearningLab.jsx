import React, { useState, useEffect } from 'react';
import { Upload, FileText, Save, Clock, RefreshCw, File, Loader2, Trash2 } from 'lucide-react';

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

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50"> {/* Adjust height for Navbar */}
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Clock size={18} className="text-gray-500" />
                        History (My Notes)
                    </h2>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{history.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No history yet.</div>
                    ) : (
                        history.map(item => (
                            <div
                                key={item._id}
                                onClick={() => loadHistoryItem(item)}
                                className={`group p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${selectedHistoryId === item._id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1.5 rounded-md ${item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {item.type === 'pdf' ? <FileText size={16} /> : <File size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`text-sm font-medium truncate ${selectedHistoryId === item._id ? 'text-blue-700' : 'text-gray-700'}`}>{item.title}</h4>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteHistoryItem(e, item._id)}
                                                disabled={deletingHistoryId === item._id}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                                                title="Delete note"
                                            >
                                                {deletingHistoryId === item._id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">{item.type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">AI Learning Lab</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Generate, edit, and save summaries from your study materials.</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                        {/* Input Column */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                {/* Tabs */}
                                <div className="flex border-b border-gray-200 bg-gray-50/50">
                                    <button
                                        onClick={() => setActiveTab('upload')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <Upload size={16} /> Upload PDF
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('text')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'text' ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <FileText size={16} /> Paste Text
                                    </button>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    {activeTab === 'upload' ? (
                                        <div className="flex-1 flex flex-col justify-center items-center py-10 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white hover:border-blue-300 transition-all group">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
                                            <p className="text-xs text-gray-400 mb-6">PDF files only (max 10MB)</p>

                                            <input
                                                type="file"
                                                id="file-upload"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                                            >
                                                Choose File
                                            </label>
                                            {file && (
                                                <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                                    <File size={14} />
                                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <textarea
                                            className="w-full flex-1 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors"
                                            placeholder="Paste your lecture notes or text here..."
                                            value={text}
                                            onChange={handleTextChange}
                                            style={{ minHeight: '300px' }}
                                        ></textarea>
                                    )}

                                    {error && <p className="text-red-500 text-sm mt-3 text-center bg-red-50 py-2 rounded-lg">{error}</p>}

                                    <button
                                        onClick={handleSummarize}
                                        disabled={loading}
                                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-xl hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                                        {loading ? 'Analyzing Content...' : 'Generate New Summary'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Output Column */}
                        <div className="lg:col-span-7 flex flex-col h-full">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden relative">
                                {!summary && !loading ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                            <FileText size={32} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-600 mb-1">Ready to Summarize</h3>
                                        <p className="max-w-xs text-sm">Upload a document or paste text to see the AI-generated summary here.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="px-5 pt-5 pb-0 border-b border-gray-100 bg-gray-50/30 flex justify-between items-start">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-gray-800 text-lg">{currentTitle || (activeTab === 'upload' ? 'PDF Summary' : 'Text Summary')}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">AI Generated • {new Date().toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={handleSave} className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                                    <Save size={14} /> Save Note
                                                </button>
                                            </div>
                                        </div>

                                        {/* Result Tabs */}
                                        <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
                                            <button
                                                onClick={() => setActiveResultTab('summary')}
                                                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeResultTab === 'summary' ? 'border-amber-500 text-amber-900 bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                Summary
                                            </button>
                                            <button
                                                onClick={() => setActiveResultTab('resources')}
                                                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeResultTab === 'resources' ? 'border-blue-500 text-blue-900 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                Related Resources
                                            </button>
                                        </div>

                                        <div className="relative flex-1 p-8 overflow-y-auto bg-amber-50/30">
                                            {loading ? (
                                                <div className="space-y-4 animate-pulse">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                                                </div>
                                            ) : (
                                                activeResultTab === 'summary' ? (
                                                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed p-6 bg-white rounded-xl border border-amber-100 shadow-sm relative">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-t-xl"></div>
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
                                                                <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`p-2 rounded-lg ${resource.type === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                            {resource.type === 'youtube' ? (
                                                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                                                            ) : (
                                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-gray-900 mb-1">{resource.title}</h4>
                                                                            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                                                View Resource <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-8 text-gray-500">
                                                                No related resources found.
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AILearningLab;
