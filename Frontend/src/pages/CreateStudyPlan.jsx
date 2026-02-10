import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';

const CreateStudyPlan = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        examDate: '',
        studyHoursPerDay: '',
        subjectsStr: '', // Comma separated for input
        weakSubjectsStr: '' // Comma separated for input
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const subjects = formData.subjectsStr.split(',').map(s => s.trim()).filter(s => s);
            const weakSubjects = formData.weakSubjectsStr.split(',').map(s => s.trim()).filter(s => s);

            if (subjects.length === 0) {
                setError('Please enter at least one subject');
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
                    examDate: formData.examDate,
                    studyHoursPerDay: Number(formData.studyHoursPerDay),
                    subjects,
                    weakSubjects
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
            <div className="max-w-3xl mx-auto px-8 py-12">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">📅</span>
                        Create Your Study Plan
                    </h2>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Exam Date
                            </label>
                            <input
                                type="date"
                                name="examDate"
                                value={formData.examDate}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Daily Study Hours
                            </label>
                            <input
                                type="number"
                                name="studyHoursPerDay"
                                value={formData.studyHoursPerDay}
                                onChange={handleChange}
                                required
                                min="1"
                                max="24"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. 4"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Subjects (comma separated)
                            </label>
                            <input
                                type="text"
                                name="subjectsStr"
                                value={formData.subjectsStr}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Math, Science, History, English"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Weak Subjects (comma separated)
                            </label>
                            <input
                                type="text"
                                name="weakSubjectsStr"
                                value={formData.weakSubjectsStr}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Math, Physics (Optional)"
                            />
                            <p className="text-xs text-gray-500 mt-1">We'll allocate more time to these subjects.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating Plan...' : 'Generate My Plan ✨'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateStudyPlan;
