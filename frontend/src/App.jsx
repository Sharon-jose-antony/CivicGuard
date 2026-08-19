import React, { useState } from 'react';
import Navbar from './components/Navbar';
import PublicComplaintList from './pages/PublicComplaintList';
import ComplaintForm from './pages/ComplaintForm';
import AdminPanel from './pages/AdminPanel';
import SecurityInfoPage from './pages/SecurityInfoPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [adminUser, setAdminUser] = useState(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={adminUser}
      />

      {/* Page Body View */}
      <main className="main-content">
        {activeTab === 'list' && (
          <PublicComplaintList />
        )}

        {activeTab === 'submit' && (
          <ComplaintForm
            onSubmissionSuccess={() => setActiveTab('list')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            adminUser={adminUser}
            setAdminUser={setAdminUser}
          />
        )}

        {activeTab === 'security-info' && (
          <SecurityInfoPage />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          CivicGuard Community Complaint Portal &copy; {new Date().getFullYear()} — Web Security Assignment Deliverable
        </div>
      </footer>
    </div>
  );
}
