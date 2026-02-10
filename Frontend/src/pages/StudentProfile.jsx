import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';

const StudentProfile = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        phone: '',
        address: '',
        profilePic: ''
    });

    const [editData, setEditData] = useState({});
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token) {
                navigate('/login');
                return;
            }

            // Fetch student profile
            const response = await fetch(`http://localhost:5000/api/students/profile/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData({
                    name: data.data.user?.name || '',
                    email: data.data.user?.email || '',
                    firstName: data.data.firstName || '',
                    lastName: data.data.lastName || '',
                    dob: data.data.dob ? new Date(data.data.dob).toISOString().split('T')[0] : '',
                    gender: data.data.gender || '',
                    phone: data.data.phone || '',
                    address: data.data.address || '',
                    profilePic: data.data.profilePic || ''
                });
                setEditData({
                    name: data.data.user?.name || '',
                    firstName: data.data.firstName || '',
                    lastName: data.data.lastName || '',
                    dob: data.data.dob ? new Date(data.data.dob).toISOString().split('T')[0] : '',
                    gender: data.data.gender || '',
                    phone: data.data.phone || '',
                    address: data.data.address || '',
                    profilePic: data.data.profilePic || ''
                });
                setImagePreview(data.data.profilePic || null);
            } else {
                setError('Failed to fetch profile');
            }
        } catch (err) {
            setError('Error loading profile: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            name: profileData.name,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            dob: profileData.dob,
            gender: profileData.gender,
            phone: profileData.phone,
            address: profileData.address,
            profilePic: profileData.profilePic
        });
        setImagePreview(profileData.profilePic);
        setError('');
    };

    const handleChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImagePreview(base64String);
                setEditData({
                    ...editData,
                    profilePic: base64String
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            const response = await fetch(`http://localhost:5000/api/students/profile/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess('Profile updated successfully!');
                setProfileData({
                    ...profileData,
                    ...editData
                });

                // Update user name in localStorage
                const updatedUser = { ...user, name: editData.name };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setIsEditing(false);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update profile');
            }
        } catch (err) {
            setError('Error updating profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <StudentNavbar />
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <StudentNavbar />
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm overflow-hidden">
                                    {profileData.profilePic ? (
                                        <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{profileData.name?.charAt(0) || profileData.firstName?.charAt(0) || 'S'}</span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{profileData.name || `${profileData.firstName} ${profileData.lastName}`}</h1>
                                    <p className="text-blue-100 flex items-center gap-2 mt-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {profileData.email}
                                    </p>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={handleEdit}
                                    className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {success}
                        </div>
                    )}

                    {/* Profile Content */}
                    <div className="p-8">
                        {isEditing ? (
                            <form onSubmit={handleSubmit}>
                                {/* Profile Picture Upload */}
                                <div className="mb-6 flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500">
                                                {editData.name?.charAt(0) || 'S'}
                                            </div>
                                        )}
                                    </div>
                                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Change Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 mt-2">Max size: 2MB</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={editData.dob}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                        <select
                                            name="gender"
                                            value={editData.gender}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={editData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <textarea
                                            name="address"
                                            value={editData.address}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                                    <p className="text-lg text-gray-900">{profileData.name || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-lg text-gray-900">{profileData.email || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">First Name</p>
                                    <p className="text-lg text-gray-900">{profileData.firstName || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Last Name</p>
                                    <p className="text-lg text-gray-900">{profileData.lastName || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                    <p className="text-lg text-gray-900">
                                        {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not set'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Gender</p>
                                    <p className="text-lg text-gray-900">{profileData.gender || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="text-lg text-gray-900">{profileData.phone || 'Not set'}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                    <p className="text-lg text-gray-900">{profileData.address || 'Not set'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
