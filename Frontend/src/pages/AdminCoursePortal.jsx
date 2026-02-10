import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminCoursePortal = () => {
	const token = localStorage.getItem('token');
	const [streams, setStreams] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [teachers, setTeachers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [subjectForm, setSubjectForm] = useState({ name: '', stream: '', teacher: '', description: '' });
	const [editingId, setEditingId] = useState('');
	const presetStreams = [
		'Physical Science',
		'Biological Science',
		'Commerce',
		'Arts',
		'Technology',
		'Others'
	];

	const fetchBaseHeaders = useMemo(() => ({
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		'Content-Type': 'application/json'
	}), [token]);

	const parseJsonSafe = async (res) => {
		const text = await res.text();
		try {
			const json = JSON.parse(text);
			if (!res.ok) {
				throw new Error(json.error || `Request failed (${res.status})`);
			}
			return json;
		} catch (err) {
			if (res.ok) {
				throw new Error(text || 'Invalid server response');
			}
			throw new Error(text || err.message || `Request failed (${res.status})`);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			try {
				const teacherPromise = token
					? fetch(`${api}/api/teachers`, { headers: { Authorization: `Bearer ${token}` } })
					: Promise.resolve(null);

				const [streamRes, subjectRes, teacherRes] = await Promise.all([
					fetch(`${api}/api/streams`),
					fetch(`${api}/api/subjects`),
					teacherPromise
				]);

				const streamData = await parseJsonSafe(streamRes);
				const subjectData = await parseJsonSafe(subjectRes);
				const teacherData = teacherRes ? await parseJsonSafe(teacherRes) : { success: true, data: [] };

				if (!streamData.success) throw new Error(streamData.error || 'Failed to load streams');
				if (!subjectData.success) throw new Error(subjectData.error || 'Failed to load subjects');
				if (!teacherData.success) throw new Error(teacherData.error || 'Failed to load teachers (admin token required)');

				const streamList = streamData.data || [];
				setStreams(streamList);
				setSubjects(subjectData.data || []);
				setTeachers(teacherData.data || []);

				// Auto-seed preset streams if none exist and we have an admin token
				if (streamList.length === 0 && token) {
					const created = [];
					for (const name of presetStreams) {
						const res = await fetch(`${api}/api/streams`, {
							method: 'POST',
							headers: fetchBaseHeaders,
							body: JSON.stringify({ name, description: '' })
						});
						const data = await parseJsonSafe(res);
						if (data.success) created.push(data.data);
					}
					if (created.length) setStreams(created);
				}

				setError('');
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [token, fetchBaseHeaders]);

	const handleSubjectSubmit = async (e) => {
		e.preventDefault();
		try {
			const isEdit = Boolean(editingId);
			const url = isEdit ? `${api}/api/subjects/${editingId}` : `${api}/api/subjects`;
			const method = isEdit ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: fetchBaseHeaders,
				body: JSON.stringify(subjectForm)
			});
			const data = await res.json();
			if (!data.success) throw new Error(data.error || 'Could not save subject');
			if (isEdit) {
				setSubjects(subjects.map((s) => (s._id === editingId ? data.data : s)));
			} else {
				setSubjects([data.data, ...subjects]);
			}
			setSubjectForm({ name: '', stream: '', teacher: '', description: '' });
			setEditingId('');
			setError('');
		} catch (err) {
			setError(err.message);
		}
	};

	const handleEditClick = (subj) => {
		setEditingId(subj._id);
		setSubjectForm({
			name: subj.name || '',
			stream: subj.stream?._id || subj.stream || '',
			teacher: subj.teacher?._id || subj.teacher || '',
			description: subj.description || ''
		});
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this subject? This will remove its lessons too.')) return;
		try {
			const res = await fetch(`${api}/api/subjects/${id}`, {
				method: 'DELETE',
				headers: fetchBaseHeaders
			});
			const data = await res.json();
			if (!data.success) throw new Error(data.error || 'Delete failed');
			setSubjects(subjects.filter((s) => s._id !== id));
			if (editingId === id) {
				setEditingId('');
				setSubjectForm({ name: '', stream: '', teacher: '', description: '' });
			}
			setError('');
		} catch (err) {
			setError(err.message);
		}
	};

	const groupedSubjects = useMemo(() => {
		return subjects.reduce((acc, subj) => {
			const key = subj.stream?.name || 'Unassigned';
			acc[key] = acc[key] ? [...acc[key], subj] : [subj];
			return acc;
		}, {});
	}, [subjects]);

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar role="admin" />
			<div className="flex-1 ml-64">
				<TopNavbar role="admin" pageName="Course Management" />
				<div className="p-8">
					<div className="max-w-7xl mx-auto">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
							<div>
								<h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
								<p className="text-gray-600">Create streams, subjects, and assign teachers.</p>
							</div>
						</div>

						{error && (
							<div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-6">
								<p className="font-medium">{error}</p>
							</div>
						)}

						{loading ? (
							<div className="flex justify-center items-center h-64">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-6">
								{/* Subject creator */}
								<div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
									<h2 className="text-xl font-semibold text-gray-800 mb-4">Create Subject</h2>
									<form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubjectSubmit}>
										<div className="md:col-span-2">
											<label className="block text-sm font-semibold text-gray-700 mb-2">Subject Name</label>
											<input
												type="text"
												value={subjectForm.name}
												onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
												required
												className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Chemistry"
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
											<select
												value={subjectForm.stream}
												onChange={(e) => setSubjectForm({ ...subjectForm, stream: e.target.value })}
												required
												className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											>
												<option value="">Select Stream</option>
												{streams.map((stream) => (
													<option key={stream._id} value={stream._id}>{stream.name}</option>
												))}
											</select>
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">Assign Teacher</label>
											<select
												value={subjectForm.teacher}
												onChange={(e) => setSubjectForm({ ...subjectForm, teacher: e.target.value })}
												required
												className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											>
												<option value="">Select Teacher</option>
												{teachers.map((teacher) => (
													<option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.user?.email})</option>
												))}
											</select>
										</div>

										<div className="md:col-span-2">
											<label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
											<textarea
												value={subjectForm.description}
												onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
												rows="3"
												className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Brief about syllabus coverage"
											/>
										</div>

										<div className="md:col-span-2 flex justify-end gap-3">
											{editingId && (
												<button
													type="button"
													onClick={() => { setEditingId(''); setSubjectForm({ name: '', stream: '', teacher: '', description: '' }); }}
													className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
												>
													Cancel
												</button>
											)}
											<button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
												{editingId ? 'Update Subject' : 'Create Subject'}
											</button>
										</div>
									</form>

									<div className="mt-8">
										<h3 className="text-lg font-semibold text-gray-800 mb-3">Subjects by Stream</h3>
										{Object.keys(groupedSubjects).length === 0 ? (
											<p className="text-gray-500 text-sm">No subjects created yet.</p>
										) : (
											<div className="space-y-4">
												{Object.entries(groupedSubjects).map(([streamName, list]) => (
													<div key={streamName} className="border border-gray-100 rounded-lg">
														<div className="px-4 py-2 bg-gray-50 font-semibold text-gray-700">{streamName}</div>
														<div className="divide-y divide-gray-100">
															{list.map((subj) => (
																<div key={subj._id} className="px-4 py-3 flex items-start justify-between gap-4">
																	<div>
																		<p className="font-semibold text-gray-800">{subj.name}</p>
																		<p className="text-sm text-gray-500">{subj.description || 'No description'}</p>
																	</div>
																	<div className="text-right">
																		<p className="text-sm text-gray-700">Teacher</p>
																		<p className="font-medium text-gray-900">{subj.teacher?.name || 'N/A'}</p>
																		<p className="text-xs text-gray-500">{subj.teacher?.user?.email}</p>
																		<div className="mt-2 flex gap-2 justify-end">
																			<button
																				onClick={() => handleEditClick(subj)}
																				className="px-3 py-1 text-sm rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
																			>
																				Edit
																			</button>
																			<button
																				onClick={() => handleDelete(subj._id)}
																				className="px-3 py-1 text-sm rounded bg-red-50 text-red-700 hover:bg-red-100"
																			>
																				Delete
																			</button>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminCoursePortal;
