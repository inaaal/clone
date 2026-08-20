import React, { useState, useEffect } from 'react';
import { admin } from '../api';

function AdminPanel({ user, onBack }) {
  const [workers, setWorkers] = useState([]);
  const [clients, setClients] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientData, setClientData] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workersRes, clientsRes] = await Promise.all([
        admin.getWorkers(),
        admin.getClients()
      ]);
      setWorkers(workersRes.data);
      setClients(clientsRes.data);
    } catch (e) {
      console.error('Error loading data', e);
    }
  };

  const createInvite = async () => {
    if (!inviteEmail || !inviteName) {
      alert('Fill in Email and name');
      return;
    }
    setLoading(true);
    try {
      await admin.createInvite({
        email: inviteEmail,
        name: inviteName,
        phone: invitePhone,
      });
      alert('Invite created!');
      setInviteEmail('');
      setInviteName('');
      setInvitePhone('');
      loadData();
    } catch (e) {
      alert('Error creating invite');
    }
    setLoading(false);
  };

  const loadClientData = async (clientId) => {
    try {
      const res = await admin.getClientData(clientId);
      setClientData(res.data);
      setSelectedClient(clientId);
    } catch (e) {
      console.error('Error loading client data', e);
    }
  };

  const deleteUser = async (userId, userName, userType) => {
    if (!window.confirm(`Delete ${userName} (${userType})? This action cannot be undone!`)) {
      return;
    }
    
    setDeleting(userId);
    try {
      await fetch(`http://localhost:5000/api/admin/delete-user/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      alert(`✅ ${userName} deleted`);
      loadData();
      if (selectedClient === userId) {
        setSelectedClient(null);
        setClientData([]);
      }
    } catch (e) {
      alert('Error deleting user');
      console.error(e);
    }
    setDeleting(null);
  };

  return (
    <div className="admin-container">
      <button onClick={onBack} className="back-btn-main">← Back</button>
      
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Welcome, {user.name}</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{workers.length}</div>
          <div className="stat-label">Workers</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{clients.length}</div>
          <div className="stat-label">Clients</div>
        </div>
      </div>

      {/* Invite Worker */}
      <div className="admin-section">
        <h3>Invite Worker</h3>
        <div className="invite-form">
          <input
            type="text"
            placeholder="Name"
            value={inviteName}
            onChange={e => setInviteName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone (optional)"
            value={invitePhone}
            onChange={e => setInvitePhone(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
          />
          <button onClick={createInvite} disabled={loading}>
            {loading ? '...' : '+ Create'}
          </button>
        </div>
      </div>

      {/* Workers List */}
      <div className="admin-section">
        <h3>Workers</h3>
        {workers.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id}>
                  <td>{w.name}</td>
                  <td>{w.phone}</td>
                  <td>{new Date(w.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => deleteUser(w.id, w.name, 'worker')}
                      disabled={deleting === w.id}
                    >
                      {deleting === w.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-text">No workers</p>
        )}
      </div>

      {/* Clients List */}
      <div className="admin-section">
        <h3>Clients</h3>
        {clients.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Data</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.data_count || 0}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn-small"
                      onClick={() => loadClientData(c.id)}
                    >
                      Data
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => deleteUser(c.id, c.name, 'client')}
                      disabled={deleting === c.id}
                      style={{ marginLeft: '4px' }}
                    >
                      {deleting === c.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-text">No clients</p>
        )}
      </div>

      {/* Client Data */}
      {selectedClient && clientData.length > 0 && (
        <div className="admin-section">
          <h3>Client Data</h3>
          <div className="client-data-grid">
            {clientData.map(item => (
              <div key={item.id} className="data-card">
                <div className="data-type-badge">{item.data_type}</div>
                <div className="data-content">
                  {item.data_type === 'screenshot' || item.data_type === 'photo' ? (
                    <img
                      src={`http://localhost:5000/${item.file_path}`}
                      alt={item.data_type}
                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : item.data_type === 'audio' ? (
                    <audio controls style={{ width: '100%' }}>
                      <source src={`http://localhost:5000/${item.file_path}`} />
                    </audio>
                  ) : (
                    <pre>{item.data_content}</pre>
                  )}
                </div>
                <div className="data-time">
                  {new Date(item.collected_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;