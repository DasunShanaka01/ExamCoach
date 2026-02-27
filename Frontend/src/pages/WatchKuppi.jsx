import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import { kuppiAPI } from '../services/api';

const WatchKuppi = () => {
    const [kuppi, setKuppi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchKuppi();
    }, [id]);

    const fetchKuppi = async () => {
        try {
            setLoading(true);
            const response = await kuppiAPI.getKuppi(id);
            setKuppi(response.data);
        } catch (err) {
            setError('Failed to load video. Please try again.');
            console.error('Error fetching kuppi:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/student/home');
    };

    if (loading) {
        return (
            <div className="page-container">
                <StudentNavbar />
                <div className="dashboard-container">
                    <div className="loading">Loading video...</div>
                </div>
            </div>
        );
    }

    if (error || !kuppi) {
        return (
            <div className="page-container">
                <StudentNavbar />
                <div className="dashboard-container">
                    <div className="error-message">{error || 'Video not found'}</div>
                    <button className="btn-secondary" onClick={handleBack}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <StudentNavbar />
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>{kuppi.title}</h1>
                    <button className="btn-secondary" onClick={handleBack}>
                        ← Back to Home
                    </button>
                </header>

                <main className="dashboard-content">
                    <div className="video-container">
                        <div className="video-wrapper">
                            {kuppi.videoUrl ? (
                                <video
                                    controls
                                    style={{
                                        width: '100%',
                                        maxWidth: '800px',
                                        height: 'auto',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <source src={kuppi.videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="video-placeholder">
                                    <p>Video not available</p>
                                </div>
                            )}
                        </div>

                        <div className="video-info">
                            <div className="video-meta">
                                <p><strong>Description:</strong> {kuppi.description}</p>
                                <p><strong>Uploaded by:</strong> {kuppi.uploadedBy?.name}</p>
                                <p><strong>Subject:</strong> {kuppi.uploadedBy?.subject}</p>
                                <p><strong>Views:</strong> {kuppi.views || 0}</p>
                                <p><strong>Uploaded:</strong> {new Date(kuppi.createdAt).toLocaleDateString()}</p>
                            </div>

                            {kuppi.tags && kuppi.tags.length > 0 && (
                                <div className="video-tags">
                                    <strong>Tags:</strong>
                                    <div className="tags">
                                        {kuppi.tags.map((tag, index) => (
                                            <span key={index} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WatchKuppi;