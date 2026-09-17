import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProofViewerModal from '../components/ProofViewerModal';
import { Clock, Eye, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function AdvisorQueue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const fetchQueue = () => {
    setLoading(true);
    api.getAdvisorDashboard()
      .then(resData => {
        setData(resData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const pending = data?.pendingCertificates || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="advisor" />

        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)' }}>
            <span className="badge badge-pending" style={{ marginBottom: '0.5rem' }}>VERIFICATION QUEUE</span>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>Pending Review Queue</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Inspect and verify student achievement documents. Approve, reject with remarks, or return for correction.
            </p>
          </div>

          <div className="glass-card">
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} color="var(--brand-green)" style={{ margin: '0 auto 0.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Queue is empty!</h3>
                <p>All student achievement submissions have been reviewed.</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Student</th>
                      <th style={{ padding: '0.75rem' }}>Vertical</th>
                      <th style={{ padding: '0.75rem' }}>Activity Name</th>
                      <th style={{ padding: '0.75rem' }}>Level & Claim</th>
                      <th style={{ padding: '0.75rem' }}>Student Remarks</th>
                      <th style={{ padding: '0.75rem' }}>Submitted On</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700 }}>{c.student_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.student_reg_no}</div>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{c.vertical_code}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.activity_name}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div>{c.level_name}</div>
                          <strong style={{ color: 'var(--brand-green)' }}>+{c.claimed_sp} SP</strong>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.student_remarks || '—'}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(c.submitted_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => setSelectedCertificate(c)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                          >
                            <Eye size={14} /> Review Proof
                          </button>
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
          isReviewer={true}
          onClose={() => setSelectedCertificate(null)}
          onReviewSubmitted={fetchQueue}
        />
      )}
    </div>
  );
}
