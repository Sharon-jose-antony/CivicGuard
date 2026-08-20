import React from 'react';
import { Shield, ListFilter, PlusCircle, Lock, BookOpen } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, adminUser }) {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('submit'); }}>
          <Shield className="shield-icon" size={28} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>CivicGuard</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                UN SDG 16
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Code for Communities — Civic Complaint Handling Portal
            </div>
          </div>
        </a>

        <ul className="nav-links">
          <li>
            <button
              className={`nav-link ${activeTab === 'submit' ? 'active' : ''}`}
              onClick={() => setActiveTab('submit')}
            >
              <PlusCircle size={18} />
              File Complaint
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Lock size={18} />
              Municipal Officer Portal {adminUser && ' (Logged In)'}
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activeTab === 'security-info' ? 'active' : ''}`}
              onClick={() => setActiveTab('security-info')}
            >
              <BookOpen size={18} />
              Security Docs
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
