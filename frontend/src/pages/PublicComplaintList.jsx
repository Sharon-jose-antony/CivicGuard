import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { MapPin, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

export default function PublicComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetMsg, setResetMsg] = useState(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for viewing photos
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const categories = ['ALL', 'Roads', 'Water', 'Streetlights', 'Sanitation'];
  const statuses = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'];

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getComplaints(selectedCategory, selectedStatus);
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError('Could not connect to Spring Boot backend API. Ensure backend is running on http://localhost:8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedCategory, selectedStatus]);

  const handleResetDb = async () => {
    try {
      await api.resetDatabase();
      setResetMsg('Database reset to clean sample complaints!');
      setTimeout(() => setResetMsg(null), 3000);
      fetchComplaints();
    } catch (err) {
      setError('Error resetting database.');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Community Complaints</h1>
          <p className="page-subtitle">
            Real-time public grievance portal monitoring infrastructure, sanitation, and municipal services.
          </p>
        </div>

        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleResetDb}>
          <RotateCcw size={14} /> Reset Database
        </button>
      </div>

      {resetMsg && (
        <div className="alert alert-success">
          <div>{resetMsg}</div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="controls-bar">
        <div className="filter-group">
          <span className="filter-label">Category:</span>
          <div className="pills-container">
            {categories.map(cat => (
              <button
                key={cat}
                className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <div className="pills-container">
            {statuses.map(st => (
              <button
                key={st}
                className={`pill-btn ${selectedStatus === st ? 'active' : ''}`}
                onClick={() => setSelectedStatus(st)}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={fetchComplaints}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading community complaints...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No complaints found matching criteria.</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filteredComplaints.map(complaint => (
            <div key={complaint.id} className="complaint-card">
              <div>
                <div className="card-header">
                  <span className="category-tag">{complaint.category}</span>
                  <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="card-location">
                  <MapPin size={14} />
                  <span>{complaint.location}</span>
                </div>

                {/* Safe React JSX Text Rendering */}
                <p className="card-description">{complaint.description}</p>

                {/* Optional Photo Attachment */}
                {complaint.photoUrl && (
                  <img
                    src={`http://localhost:8080${complaint.photoUrl}`}
                    alt="Complaint Evidence"
                    className="card-photo"
                    onClick={() => setSelectedPhoto(`http://localhost:8080${complaint.photoUrl}`)}
                  />
                )}
              </div>

              <div className="card-footer">
                <span>By: {complaint.name}</span>
                <span>
                  {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>&times;</button>
            <img src={selectedPhoto} alt="Full View" style={{ width: '100%', borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </div>
  );
}
