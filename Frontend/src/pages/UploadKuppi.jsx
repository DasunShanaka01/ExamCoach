import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { kuppiAPI } from '../services/api';

const UploadKuppi = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        duration: ''
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WebM)');
                return;
            }
            // Validate file size (max 500MB)
            if (file.size > 500 * 1024 * 1024) {
                alert('Video file size must be less than 500MB');
                return;
            }
            setVideoFile(file);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, JPG, PNG)');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Thumbnail file size must be less than 5MB');
                return;
            }
            setThumbnailFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!videoFile) {
            alert('Please select a video file to upload');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const submitData = new FormData();

            // Add form fields
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('subject', formData.subject);
            submitData.append('duration', formData.duration);

            // Add files
            submitData.append('video', videoFile);
            if (thumbnailFile) {
                submitData.append('thumbnail', thumbnailFile);
            }

            const data = await kuppiAPI.uploadKuppi(submitData);

            if (data.success) {
                alert('Kuppi session uploaded successfully!');
                navigate('/teacher/dashboard');
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="layout-container">
            <Sidebar role="teacher" />
            <div className="main-content">
                <div className="form-container">
                    <h2>Upload Kuppi Session</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Video File *</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                required
                            />
                            {videoFile && (
                                <small className="file-info">
                                    Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </small>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label>Thumbnail Image (optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                            />
                            {thumbnailFile && (
                                <small className="file-info">
                                    Selected: {thumbnailFile.name} ({(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </small>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                                min="1"
                            />
                        </div>
                        
                        {loading && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p>Uploading... {uploadProgress}%</p>
                            </div>
                        )}
                        
                        <button type="submit" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Kuppi'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadKuppi;