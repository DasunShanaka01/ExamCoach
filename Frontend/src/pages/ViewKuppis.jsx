import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { kuppiAPI } from '../services/api';

const ViewKuppis = () => {
    const navigate = useNavigate();
    const [kuppis, setKuppis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchKuppis();
    }, []);

    const fetchKuppis = async () => {
        try {
            setLoading(true);
            const data = await kuppiAPI.getKuppis();
            if (data.success) {
                setKuppis(data.data);
            } else {
                setError(data.error || 'Failed to load kuppi sessions');
            }
        } catch (err) {
            setError('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWatchKuppi = (kuppiId) => {
        navigate(`/student/watch-kuppi/${kuppiId}`);
    };

    const handleDeleteKuppi = async (kuppiId) => {
        if (window.confirm('Are you sure you want to delete this kuppi session?')) {
            try {
                await kuppiAPI.deleteKuppi(kuppiId);
                setKuppis(kuppis.filter(k => k._id !== kuppiId));
                alert('Kuppi deleted successfully');
            } catch (err) {
                alert('Delete failed: ' + err.message);
            }
        }
    };

    return (
        <div className="layout-container">
            <Sidebar role="teacher" />
            <div className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <h1>Kuppi Sessions</h1>
                        <button onClick={() => navigate('/teacher/upload-kuppi')} className="btn-primary">
                            Upload New Kuppi
                        </button>
                    </header>

                    {loading && <p>Loading kuppi sessions...</p>}
                    {error && <div className="error-message">{error}</div>}

                    <div className="kuppis-grid">
                        {kuppis.length === 0 ? (
                            <p>No kuppi sessions available yet.</p>
                        ) : (
                            kuppis.map((kuppi) => (
                                <div key={kuppi._id} className="kuppi-card">
                                    {kuppi.thumbnailUrl && (
                                        <div className="kuppi-thumbnail">
                                            <img src={kuppi.thumbnailUrl} alt={kuppi.title} />
                                            <div className="play-overlay">▶</div>
                                        </div>
                                    )}
                                    <div className="kuppi-content">
                                        <h3>{kuppi.title}</h3>
                                        <p className="kuppi-subject">📚 {kuppi.subject}</p>
                                        <p className="kuppi-description">{kuppi.description}</p>
                                        <div className="kuppi-meta">
                                            <span>⏱️ {kuppi.duration} mins</span>
                                            <span>👁️ {kuppi.views} views</span>
                                        </div>
                                        <p className="kuppi-date">
                                            Uploaded: {new Date(kuppi.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="kuppi-actions">
                                            <button 
                                                onClick={() => handleWatchKuppi(kuppi._id)}
                                                className="btn-primary"
                                            >
                                                Watch Video
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteKuppi(kuppi._id)}
                                                className="btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewKuppis;