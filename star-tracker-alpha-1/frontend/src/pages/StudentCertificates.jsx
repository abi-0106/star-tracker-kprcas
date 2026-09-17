import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProofViewerModal from '../components/ProofViewerModal';
import ExportButton from '../components/ExportButton';
import { FileCheck, Eye, Search, PlusCircle, RotateCcw } from 'lucide-react';
import { api } from '../services/api';

export default function StudentCertificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCertificates = () => {
    setLoading(true);
    api.getStudentCertificates()
      .then(data => {
        if (data && data.certificates) setCertificates(data.certificates);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const filteredCerts = certificates.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.activity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vertical_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vertical_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="student" />

        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Header */}
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>CERTIFICATE HISTORY & AUDIT</span>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>Uploaded Certificate Submissions</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Complete audit trail of submitted proofs, verification status, and advisor feedback.
              </p>
            </div>

            <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <ExportButton
                buttonText="Export Certificate Log"
                getExportOptions={() => ({
                  title: 'Student Certificate Submissions History',
                  fileName: 'Certificate_History',
                  columns: [
                    { header: 'Vertical', key: 'vertical_code' },
                    { header: 'Activity', key: 'activity_name' },
                    { header: 'Level', key: 'level_name' },
                    { header: 'Claimed SP', key: 'claimed_sp', formatter: val => `${val} SP` },
                    { header: 'Status', key: 'status', formatter: val => (val || 'pending').toUpperCase() },
                    { header: 'Submitted Date', key: 'submitted_at', formatter: val => val ? new Date(val).toLocaleDateString() : '' },
                    { header: 'Advisor Remarks', key: 'advisor_remarks', formatter: val => val || '-' },
                  ],
                  data: filteredCerts,
                })}
              />

              <button onClick={() => navigate('/student/submit')} className="btn btn-primary">
                <PlusCircle size={16} /> Submit New Proof
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Status Filter Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', 'pending', 'approved', 'rejected', 'returned'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 20,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      border: statusFilter === st ? '2px solid var(--brand-blue)' : '1px solid var(--border-color)',
                      background: statusFilter === st ? 'var(--brand-blue-light)' : 'transparent',
                      color: statusFilter === st ? 'var(--brand-blue)' : 'var(--text-secondary)',
                    }}
                  >
                    {st} ({st === 'all' ? certificates.length : certificates.filter(c => c.status === st).length})
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter by activity / vertical..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: 32, fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="glass-card">
            {filteredCerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <FileCheck size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No certificates found matching your criteria.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Vertical</th>
                      <th style={{ padding: '0.75rem' }}>Activity Name</th>
                      <th style={{ padding: '0.75rem' }}>Level</th>
                      <th style={{ padding: '0.75rem' }}>Claimed SP</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Submitted Date</th>
                      <th style={{ padding: '0.75rem' }}>Advisor Remarks</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCerts.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{c.vertical_code}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.activity_name}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{c.level_name}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--brand-green)' }}>+{c.claimed_sp} SP</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge badge-${c.status || 'pending'}`}>{c.status}</span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(c.submitted_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.advisor_remarks || '—'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => setSelectedCertificate(c)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            >
                              <Eye size={14} /> View
                            </button>
                            {c.status === 'returned' && (
                              <button
                                onClick={() => navigate('/student/submit')}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', background: '#6D28D9' }}
                                title="Re-upload corrected proof"
                              >
                                <RotateCcw size={14} /> Resubmit
                              </button>
                            )}
                          </div>
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

      {selectedCertificate && (
        <ProofViewerModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
