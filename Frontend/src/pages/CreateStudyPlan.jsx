import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';

const CreateStudyPlan = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        studyHoursPerDay: '',
        subjects: [] // Array of { name, examDate, isWeak }
    });

    // Temp state for adding a subject
    const [currentSubject, setCurrentSubject] = useState({
        name: '',
        examDate: '',
        isWeak: false
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.plan) {
            const { studyHoursPerDay, subjects } = location.state.plan;
            // Map backend subject format to frontend if needed (should be same now)
            // Backend sends { name, examDate, isWeak } in subjects array
            const formattedSubjects = subjects.map(s => ({
                name: s.name,
                examDate: new Date(s.examDate).toISOString().split('T')[0],
                isWeak: s.isWeak
            }));

            setFormData({
                studyHoursPerDay,
                subjects: formattedSubjects
            });
        }
    }, [location.state]);

    const handleAddSubject = (e) => {
        e.preventDefault();
        if (!currentSubject.name.trim() || !currentSubject.examDate) {
            return;
        }

        // Check for duplicates
        if (formData.subjects.some(s => s.name.toLowerCase() === currentSubject.name.trim().toLowerCase())) {
            setError('Subject already exists');
            return;
        }

        setFormData({
            ...formData,
            subjects: [...formData.subjects, { ...currentSubject, name: currentSubject.name.trim() }]
        });

        // Reset current subject input
        setCurrentSubject({
            name: '',
            examDate: '',
            isWeak: false
        });
        setError('');
    };

    const handleRemoveSubject = (subjectName) => {
        setFormData({
            ...formData,
            subjects: formData.subjects.filter(s => s.name !== subjectName)
        });
    };

    const handleEditSubject = (subject) => {
        setCurrentSubject({
            name: subject.name,
            examDate: new Date(subject.examDate).toISOString().split('T')[0],
            isWeak: subject.isWeak
        });
        handleRemoveSubject(subject.name);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (formData.subjects.length === 0) {
                setError('Please add at least one subject');
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/study-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studyHoursPerDay: Number(formData.studyHoursPerDay),
                    subjects: formData.subjects
                })
            });

            const data = await response.json();

            if (data.success) {
                navigate('/student/view-plan');
            } else {
                setError(data.error || 'Failed to create plan');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <StudentNavbar />
            <div className="max-w-4xl mx-auto px-8 py-12">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        Create Your Study Plan
                    </h2>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Daily Hours Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Daily Study Hours
                            </label>
                            <input
                                type="number"
                                value={formData.studyHoursPerDay}
                                onChange={(e) => setFormData({ ...formData, studyHoursPerDay: e.target.value })}
                                required
                                min="1"
                                max="24"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. 4"
                            />
                        </div>

                        {/* Add Subject Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Subjects & Exam Dates</h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-5">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Subject Name</label>
                                    <input
                                        type="text"
                                        value={currentSubject.name}
                                        onChange={(e) => setCurrentSubject({ ...currentSubject, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Math"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubject(e)}
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Exam Date</label>
                                    <input
                                        type="date"
                                        value={currentSubject.examDate}
                                        onChange={(e) => setCurrentSubject({ ...currentSubject, examDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center justify-center pb-3">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={currentSubject.isWeak}
                                            onChange={(e) => setCurrentSubject({ ...currentSubject, isWeak: e.target.checked })}
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Weak?</span>
                                    </label>
                                </div>
                                <div className="md:col-span-1">
                                    <button
                                        type="button"
                                        onClick={handleAddSubject}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold text-xl flex items-center justify-center"
                                        title="Add Subject"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Subject List */}
                        {formData.subjects.length > 0 && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">Added Subjects:</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {formData.subjects.map((subject, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleEditSubject(subject)}
                                            className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors group"
                                            title="Click to edit"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-10 rounded-full ${subject.isWeak ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 group-hover:text-blue-600">{subject.name}</h4>
                                                    <p className="text-sm text-gray-500">Exam: {new Date(subject.examDate).toLocaleDateString()}</p>
                                                </div>
                                                {subject.isWeak && (
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold">Weak Area</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent edit when clicking remove
                                                    handleRemoveSubject(subject.name);
                                                }}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating Plan...' : 'Generate My Plan'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateStudyPlan;
