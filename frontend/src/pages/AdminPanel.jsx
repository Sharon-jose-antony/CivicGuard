import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { Lock, LogOut, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export default function AdminPanel({ adminUser, setAdminUser }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass123!');
  const [loginError, setLoginError] = useState(null);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.authenticated) {
        setAdminUser(res);
        fetchComplaints();
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      setAdminUser(null);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints('ALL', 'ALL');
      setComplaints(data);
    } catch (err) {
      setErrorMessage('Error fetching complaints list for admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const user = await api.login(username, password);
      setAdminUser(user);
      fetchComplaints();
    } catch (err) {
      setLoginError('Invalid credentials. Use admin / AdminPass123!');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setAdminUser(null);
      setComplaints([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      await api.updateComplaintStatus(id, newStatus);
      setStatusMessage(`Status updated to ${newStatus} for Complaint #${id}`);
      fetchComplaints();
    } catch (err) {
      const errDetail = err.response?.status === 403 || err.response?.status === 401
        ? 'HTTP 403 Forbidden: CSRF token missing or invalid!'
        : err.response?.data?.error || 'Failed to update status.';
      setErrorMessage(errDetail);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete complaint #${id}?`)) return;
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await api.deleteComplaint(id);
      setStatusMessage(`Complaint #${id} deleted successfully.`);
      fetchComplaints();
    } catch (err) {
      const errDetail = err.response?.status === 403 || err.response?.status === 401
        ? 'HTTP 403 Forbidden: CSRF token missing or invalid!'
        : err.response?.data?.error || 'Failed to delete complaint.';
      setErrorMessage(errDetail);
    }
  };

  if (!adminUser) {
    return (
      <div className="container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Admin Panel Authentication</h1>
          <p className="page-subtitle">
            Secure session-based login for municipal administrator control.
          </p>
        </div>

        <div className="form-card" style={{ maxWidth: '440px' }}>
          {loginError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <div>{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Admin Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              💡 Default Demo Credentials: <code>admin</code> / <code>AdminPass123!</code>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Lock size={18} />
              Login to Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Municipal Admin Control Panel</h1>
          <p className="page-subtitle">
            Logged in as <strong>{adminUser.username}</strong> ({adminUser.role})
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleLogout}>
          <LogOut size={16} />
          Logout Session
        </button>
      </div>

      {statusMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <div>{statusMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{errorMessage}</div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', color: '#ffffff' }}>Manage Complaints</h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading complaints list...</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No complaints registered.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>ID</th>
                  <th style={{ padding: '0.75rem' }}>Name & Location</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Description</th>
                  <th style={{ padding: '0.75rem' }}>Current Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>#{item.id}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.location}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="category-tag">{item.category}</span>
                    </td>
                    <td style={{ padding: '0.75rem', maxWidth: '280px' }}>
                      {item.description}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="pill-btn"
                          onClick={() => handleStatusUpdate(item.id, 'PENDING')}
                          title="Mark Pending"
                        >
                          Pending
                        </button>
                        <button
                          className="pill-btn"
                          onClick={() => handleStatusUpdate(item.id, 'IN_PROGRESS')}
                          title="Mark In Progress"
                        >
                          Progress
                        </button>
                        <button
                          className="pill-btn"
                          onClick={() => handleStatusUpdate(item.id, 'RESOLVED')}
                          title="Mark Resolved"
                        >
                          Resolved
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(item.id)}
                          title="Delete Complaint"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
