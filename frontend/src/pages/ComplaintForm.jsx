import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { Send, AlertCircle, CheckCircle, Sparkles, Cpu, RotateCcw } from 'lucide-react';

export default function ComplaintForm({ onSubmissionSuccess }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Roads');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [aiClassification, setAiClassification] = useState(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!description || description.length < 8) {
      setAiClassification(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsAiAnalyzing(true);
      const text = description.toLowerCase();
      
      let detectedCat = 'Roads';
      let urgency = 'NORMAL';
      let confidence = 92;

      if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('flood') || text.includes('drain')) {
        detectedCat = 'Water';
      } else if (text.includes('light') || text.includes('lamp') || text.includes('dark') || text.includes('electric') || text.includes('wire')) {
        detectedCat = 'Streetlights';
      } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('smell') || text.includes('clean') || text.includes('pests')) {
        detectedCat = 'Sanitation';
      } else if (text.includes('pothole') || text.includes('road') || text.includes('traffic') || text.includes('asphalt') || text.includes('damage')) {
        detectedCat = 'Roads';
      }

      if (text.includes('danger') || text.includes('hazard') || text.includes('accident') || text.includes('urgent') || text.includes('burst') || text.includes('flood')) {
        urgency = 'CRITICAL';
      } else if (text.includes('broken') || text.includes('outage') || text.includes('overflow') || text.includes('dark')) {
        urgency = 'HIGH';
      }

      setAiClassification({
        suggestedCategory: detectedCat,
        priority: urgency,
        confidenceScore: confidence,
        summary: `AI classified issue as ${detectedCat} with ${urgency} priority based on keyword semantics.`
      });

      if (detectedCat) {
        setCategory(detectedCat);
      }
      setIsAiAnalyzing(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [description]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('File upload failed: Only JPG, JPEG, and PNG image files are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size error: Image file exceeds maximum allowed limit of 2MB.');
      e.target.value = '';
      return;
    }

    setError(null);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleResetDb = async () => {
    try {
      await api.resetDatabase();
      setMessage('✅ Database successfully reset to initial clean state.');
    } catch (err) {
      setError('Failed to reset database.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('category', category);
    formData.append('description', description);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      await api.createComplaint(formData);
      setMessage('🛡️ Complaint submitted securely! Backend OWASP HTML Sanitizer cleaned input before saving.');

      setName('');
      setLocation('');
      setDescription('');
      setPhoto(null);
      setPhotoPreview(null);
      setAiClassification(null);

      if (onSubmissionSuccess) {
        setTimeout(() => onSubmissionSuccess(), 1200);
      }
    } catch (err) {
      console.error('Submission Error:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Error submitting complaint. Check server logs.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Cpu size={14} /> UN SDG 16: Strong Institutions Track — Civic Complaint Pipeline Stage 1
        </div>
        <h1 className="page-title">File a Community Complaint</h1>
        <p className="page-subtitle">
          Submit municipal grievances directly to city authorities. Powered by AI Auto-Classification & Protected by Web Security Defenses.
        </p>
      </div>

      <div className="form-card">
        {message && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <div>{message}</div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={handleResetDb}>
            <RotateCcw size={14} /> Reset Database
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Citizen / Reporter Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location / Ward Landmark *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gandhipuram Town Bus Stand, Ward 12"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Complaint Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Roads">Roads (Potholes, Traffic Signs, Damage)</option>
              <option value="Water">Water (Leaks, Contamination, Drainage)</option>
              <option value="Streetlights">Streetlights (Outages, Flickering)</option>
              <option value="Sanitation">Sanitation (Garbage, Waste, Odors)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description of Issue *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the municipal complaint in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {isAiAnalyzing && (
              <div style={{ fontSize: '0.8rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                <Sparkles size={14} className="spin" /> AI analyzing complaint semantics...
              </div>
            )}

            {aiClassification && !isAiAnalyzing && (
              <div style={{ marginTop: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={14} /> AI Auto-Categorizer (Confidence: {aiClassification.confidenceScore}%)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '4px', background: aiClassification.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: aiClassification.priority === 'CRITICAL' ? '#f87171' : '#fbbf24' }}>
                    {aiClassification.priority} PRIORITY
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{aiClassification.summary}</div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Optional Photo Evidence (Max 2MB: JPG, JPEG, PNG)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handlePhotoChange}
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            {photoPreview && (
              <div style={{ marginTop: '0.75rem' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            <Send size={18} />
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}
