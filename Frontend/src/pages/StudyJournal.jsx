import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../layouts/StudentLayout';
import { FiBook, FiCalendar, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

const StudyJournal = () => {
    const navigate = useNavigate();
    const [journal, setJournal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingDay, setEditingDay] = useState(null);
    const [editNote, setEditNote] = useState('');

    useEffect(() => {
        fetchJournal();
    }, []);

    const fetchJournal = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan/journal', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            console.log('[Journal Frontend] Response:', data);
            console.log('[Journal Frontend] Data length:', data.data?.length);

            if (data.success) {
                setJournal(data.data);
            }
        } catch (err) {
            console.error('[Journal Frontend] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (entry) => {
        setEditingDay(entry.day);
        setEditNote(entry.note);
    };

    const handleDone = async () => {
        if (!editingDay) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/study-plan/timetable/note/${editingDay}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ note: editNote })
            });

            setEditingDay(null);
            fetchJournal();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (day) => {
        if (!window.confirm('Delete this note?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/study-plan/timetable/note/${day}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ note: '' })
            });

            fetchJournal();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </StudentLayout>
        );
    }

    if (journal.length === 0) {
        return (
            <StudentLayout>
                <div className="bg-white p-12 rounded-3xl shadow-xl text-center">
                    <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Journal Entries Yet</h2>
                    <p className="text-gray-600 mb-8">Start adding notes to your daily study sessions in the timetable.</p>
                    <button
                        onClick={() => navigate('/student/timetable')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                        Go to Timetable
                    </button>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Study Journal</h1>
                    <p className="text-gray-500 mt-2">Your daily study notes and reflections</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {journal.map((entry) => {
                        const isEditing = editingDay === entry.day;
                        const stickyColors = [
                            'bg-yellow-100 border-yellow-300',
                            'bg-pink-100 border-pink-300',
                            'bg-blue-100 border-blue-300',
                            'bg-green-100 border-green-300',
                            'bg-purple-100 border-purple-300'
                        ];
                        const colorClass = stickyColors[entry.day % stickyColors.length];

                        return (
                            <div 
                                key={entry.day} 
                                className={`${colorClass} border-2 rounded-lg p-5 shadow-md hover:shadow-xl transition-shadow relative overflow-hidden`}
                                style={{ minHeight: '200px', maxHeight: '400px' }}
                            >
                                {/* Sticky Note Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-white bg-opacity-60 rounded-full flex items-center justify-center border border-gray-300">
                                            <span className="text-sm font-bold text-gray-700">{entry.day}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700">Day {entry.day}</p>
                                            <p className="text-xs text-gray-600">
                                                {new Date(entry.date).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        {isEditing ? (
                                            <button
                                                onClick={handleDone}
                                                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                                title="Done"
                                            >
                                                <FiCheck className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    className="p-1.5 bg-white bg-opacity-60 text-gray-700 rounded-md hover:bg-opacity-100 transition-all"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry.day)}
                                                    className="p-1.5 bg-white bg-opacity-60 text-red-600 rounded-md hover:bg-opacity-100 transition-all"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Note Content */}
                                <div className="mb-4 flex-1">
                                    {isEditing ? (
                                        <textarea
                                            value={editNote}
                                            onChange={(e) => setEditNote(e.target.value)}
                                            className="w-full p-2 bg-white bg-opacity-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm resize-none"
                                            rows="8"
                                            placeholder="Write your note..."
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                                            {entry.note}
                                        </p>
                                    )}
                                </div>

                                {/* Sticky Note Shadow Effect */}
                                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-gray-400 opacity-20 rounded-br-lg"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudyJournal;
