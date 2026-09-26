import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';

export default function AdminAudit() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAuditLogs();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    return l.action?.toLowerCase().includes(search.toLowerCase()) || 
           l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
           l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
           l.details?.toLowerCase().includes(search.toLowerCase());
  });

  const exportData = filteredLogs.map(l => ({
    'Timestamp': new Date(l.created_at).toLocaleString(),
    'User': l.user_name || 'System',
    'Action': l.action,
    'Entity': l.entity_type,
    'Entity ID': l.entity_id || 'N/A',
    'Details': l.details || ''
  }));

  const userRole = user?.role || 'admin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole={userRole} role={userRole} />
        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Header */}
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>SECURITY & COMPLIANCE</span>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>System Audit Trail</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Immutable audit log of all system approvals, modifications, and user actions.
              </p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <ExportButton 
                data={exportData} 
                filename="Star_Tracker_Audit_Logs" 
                title="KPRCAS Star Tracker - System Audit Trail"
                columns={[
                  { header: 'Timestamp', dataKey: 'Timestamp' },
                  { header: 'User', dataKey: 'User' },
                  { header: 'Action', dataKey: 'Action' },
                  { header: 'Entity', dataKey: 'Entity' },
                  { header: 'Details', dataKey: 'Details' }
                ]}
              />
            </div>
          </div>

          {/* Search */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search audit trail by user, action, or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="glass-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                <p>Loading Audit Logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No Audit Records Found</h3>
                <p>No audit trail records match the search filter.</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Timestamp</th>
                      <th style={{ padding: '0.75rem' }}>User</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                      <th style={{ padding: '0.75rem' }}>Entity</th>
                      <th style={{ padding: '0.75rem' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.user_name || 'System'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: log.action?.includes('APPROVE') ? 'rgba(32,142,71,0.12)' : (log.action?.includes('REJECT') ? 'rgba(220,38,38,0.12)' : 'rgba(43,77,145,0.12)'),
                            color: log.action?.includes('APPROVE') ? 'var(--brand-green)' : (log.action?.includes('REJECT') ? '#DC2626' : 'var(--brand-blue)'),
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 400, wordBreak: 'break-word' }}>
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
