import { useEffect, useMemo, useState } from 'react';
import StudentNavbar from '../components/StudentNavbar';
import LessonView from '../components/LessonView';

const api = 'http://localhost:5000';

const CourseExplorer = () => {
	const [streams, setStreams] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [selectedStream, setSelectedStream] = useState('');
	const [selectedSubject, setSelectedSubject] = useState('');
	const [lessons, setLessons] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const load = async () => {
			try {
				const [streamRes, subjectRes] = await Promise.all([
					fetch(`${api}/api/streams`),
					fetch(`${api}/api/subjects`)
				]);
				const [streamData, subjectData] = await Promise.all([streamRes.json(), subjectRes.json()]);
				if (!streamData.success) throw new Error(streamData.error || 'Failed to load streams');
				if (!subjectData.success) throw new Error(subjectData.error || 'Failed to load subjects');
				setStreams(streamData.data || []);
				setSubjects(subjectData.data || []);
				
				// Set initial stream if available
				if (streamData.data?.length) {
					const initialStreamId = streamData.data[0]._id;
					setSelectedStream(initialStreamId);

					// Filter subjects for this initial stream
					const initialStreamSubjects = (subjectData.data || []).filter(s => s.stream?._id === initialStreamId);
					if (initialStreamSubjects.length) {
						setSelectedSubject(initialStreamSubjects[0]._id);
					}
				}
				setError('');
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	useEffect(() => {
		if (!selectedSubject) return;
		const fetchLessons = async () => {
			try {
				const res = await fetch(`${api}/api/subjects/${selectedSubject}/lessons`);
				const data = await res.json();
				if (!data.success) throw new Error(data.error || 'Failed to load lessons');
				setLessons(data.data || []);
			} catch (err) {
				setError(err.message);
			}
		};
		fetchLessons();
	}, [selectedSubject]);

	const filteredSubjects = useMemo(() => {
		if (!selectedStream) return subjects;
		return subjects.filter((s) => s.stream?._id === selectedStream);
	}, [subjects, selectedStream]);

	useEffect(() => {
		if (filteredSubjects.length > 0) {
			const currentSubj = filteredSubjects.find((s) => s._id === selectedSubject);
			if (!currentSubj) {
				setSelectedSubject(filteredSubjects[0]._id);
			}
		} else {
			setSelectedSubject('');
		}
	}, [filteredSubjects, selectedSubject]);

	return (
		<div className="min-h-screen bg-gray-50">
			<StudentNavbar />
			<div className="max-w-7xl mx-auto px-6 py-10">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-gray-800">Course Explorer</h1>
						<p className="text-gray-600">Browse A/L streams, subjects, and lesson materials.</p>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-4">
						<p className="font-medium">{error}</p>
					</div>
				)}

				{loading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-4">
							<div>
								<h3 className="text-sm font-semibold text-gray-700 mb-2">Select Stream</h3>
								<select
									value={selectedStream}
									onChange={(e) => setSelectedStream(e.target.value)}
									className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									{streams.map((stream) => (
										<option key={stream._id} value={stream._id}>{stream.name}</option>
									))}
								</select>
							</div>

							<div>
								<h3 className="text-sm font-semibold text-gray-700 mb-2">Subjects</h3>
								<div className="space-y-2 max-h-80 overflow-y-auto pr-1">
									{filteredSubjects.map((subj) => (
										<button
											key={subj._id}
											onClick={() => setSelectedSubject(subj._id)}
											className={`w-full text-left px-3 py-2 rounded-lg border transition ${selectedSubject === subj._id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'}`}
										>
											<p className="font-semibold">{subj.name}</p>
											<p className="text-xs text-gray-500">{subj.teacher?.name}</p>
										</button>
									))}
									{!filteredSubjects.length && <p className="text-sm text-gray-500">No subjects in this stream.</p>}
								</div>
							</div>
						</div>

						<div className="lg:col-span-2">
							<LessonView lessons={lessons} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CourseExplorer;
