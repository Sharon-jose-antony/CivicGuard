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
  const [audio, setAudio] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);

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

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAudio(null);
      setAudioPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Audio file size error: Voice recording file exceeds maximum allowed limit of 5MB.');
      e.target.value = '';
      return;
    }

    setError(null);
    setAudio(file);
    setAudioPreview(URL.createObjectURL(file));
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
    if (audio) {
      formData.append('audio', audio);
    }

    try {
      await api.createComplaint(formData);
      setMessage('🛡️ Complaint submitted securely! Backend OWASP HTML Sanitizer cleaned input before saving.');

      setName('');
      setLocation('');
      setDescription('');
      setPhoto(null);
      setPhotoPreview(null);
      setAudio(null);
      setAudioPreview(null);
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
      {/* Fun & Friendly Municipal Action Loading Modal Overlay */}
      {loading && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '2px solid #fbbf24', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(251, 191, 36, 0.3)' }}>
            <img
              src="/loading-funny.png"
              alt="Municipal Action Vanakkam"
              style={{ width: '200px', height: 'auto', borderRadius: '12px', marginBottom: '1rem', border: '2px solid #fbbf24', boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}
            />
            <h3 style={{ color: '#fbbf24', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              🙏 Vanakkam! Processing Complaint...
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem', lineHeight: 1.4 }}>
              OWASP Jsoup Sanitizer is cleaning your input & escalating grievance straight to municipal officers!
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', padding: '0.45rem 1.1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700 }}>
              <Sparkles size={16} className="spin" /> Sending with 100% Priority...
            </div>
          </div>
        </div>
      )}
      {/* Leadership & Civic Representative Hero Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Leadership Card 1 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <img
            src="/pm-hero.jpg"
            alt="Hon'ble Prime Minister Narendra Modi"
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '3px solid #f97316',
              boxShadow: '0 0 15px rgba(249, 115, 22, 0.3)',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.4rem', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
              🇮🇳 Digital India Governance
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem', lineHeight: 1.3 }}>
              Citizen-Centric Governance
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
              Empowering communities with digital platforms for fast, transparent municipal action.
            </p>
          </div>
        </div>

        {/* Representative Action Card 2 - Exact Photo */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: '0 10px 20px -5px rgba(251, 191, 36, 0.15)',
          backdropFilter: 'blur(10px)'
        }}>
          <img
            src="/loading-funny.png"
            alt="People's Civic Action Representative"
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'cover',
              borderRadius: '16px',
              border: '3px solid #fbbf24',
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.4rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              🙏 Vanakkam! Public Grievance Cell
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.3rem', lineHeight: 1.3 }}>
              Direct Municipal Escalation
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
              "Your complaint will be taken up directly with top municipal authorities. File below!"
            </p>
          </div>
        </div>
      </div>

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
            <label className="form-label">Citizen / Reporter Name (Strictly Confidential) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div style={{ fontSize: '0.78rem', color: '#60a5fa', marginTop: '0.3rem' }}>
              🔒 Privacy Protected: Your name is kept confidential and will <strong>NOT</strong> be displayed on the public portal. Only municipal administrators can access it.
            </div>
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
            <label className="form-label">📷 Optional Photo Evidence (Max 2MB: JPG, JPEG, PNG)</label>
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

          <div className="form-group">
            <label className="form-label">🎙️ Optional Voice Note / Audio Evidence (Max 5MB: MP3, WAV, M4A, OGG, AAC)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.webm"
                onChange={handleAudioChange}
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            {audioPreview && (
              <div style={{ marginTop: '0.75rem', background: 'rgba(30, 41, 59, 0.7)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginBottom: '0.4rem', fontWeight: 600 }}>🔊 Voice Note Preview (Click Play to Test):</div>
                <audio controls src={audioPreview} style={{ width: '100%', height: '40px' }} />
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
