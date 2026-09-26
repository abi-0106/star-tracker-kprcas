import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProofViewerModal from '../components/ProofViewerModal';
import CertificateSubmitModal from '../components/CertificateSubmitModal';
import ExportButton from '../components/ExportButton';
import { Award, CheckCircle2, AlertTriangle, FileText, PlusCircle, Trophy, Clock, Eye, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    api.getStudentDashboard()
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Student Portal...</p>
      </div>
    );
  }

  const { user, scores, recentCertificates, rankInfo } = data;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="student" />

        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Welcome Banner */}
          <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)' }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>{user.department_name || 'School of IT'}</span>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>Welcome back, {user.name}!</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Register No: <strong>{user.reg_no_emp_id}</strong> &bull; Class: <strong>{user.class_name || 'I B.Com (IT) - A'}</strong> &bull; Semester: <strong>{user.semester}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <ExportButton
                buttonText="Export My Report"
                getExportOptions={() => ({
                  title: `Student Performance & Activity Report — ${user.name}`,
                  department: user.department_name || 'School of IT Integrated Commerce',
                  className: user.class_name || 'Student Portal',
                  generatedBy: `${user.name} (${user.reg_no_emp_id})`,
                  fileName: `My_STAR_Report_${user.reg_no_emp_id}`,
                  columns: [
                    { header: 'Vertical', key: 'vertical_code' },
                    { header: 'Activity Name', key: 'activity_name' },
                    { header: 'Level', key: 'level_name' },
                    { header: 'Claimed SP', key: 'claimed_sp', formatter: val => `${val} SP` },
                    { header: 'Status', key: 'status', formatter: val => (val || 'pending').toUpperCase() },
                    { header: 'Submitted Date', key: 'submitted_at', formatter: val => val ? new Date(val).toLocaleDateString() : '' },
                    { header: 'Advisor Remarks', key: 'advisor_remarks', formatter: val => val || '-' },
                  ],
                  data: recentCertificates,
                })}
              />

              <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary">
                <PlusCircle size={17} />
                <span>Submit Activity Proof</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.15rem', marginBottom: '2rem' }}>
            {/* 1. Total Star Points */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Star Points</span>
                <Award size={19} color="var(--brand-green)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>
                {scores.total_sp} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 200 SP</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Regular: {scores.regular_sp} SP &bull; Bonus: {scores.bonus_sp} SP
              </div>
            </div>

            {/* 2. Internal Marks (100 Scale) */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Internal Marks (100 Scale)</span>
                <FileText size={19} color="var(--brand-blue)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1.1 }}>
                {scores.internal_marks_100} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 100 Marks</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Conversion: <strong>2 Star Points = 1 Mark</strong>
              </div>
            </div>

            {/* 3. Mandatory Verticals Status */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Mandatory Verticals</span>
                {scores.mandatory_satisfied ? (
                  <CheckCircle2 size={19} color="var(--brand-green)" />
                ) : (
                  <AlertTriangle size={19} color="#D97706" />
                )}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: scores.mandatory_satisfied ? 'var(--brand-green)' : '#D97706', lineHeight: 1.1 }}>
                {scores.mandatory_passed_count} / {scores.mandatory_total_count} Passed
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {scores.mandatory_satisfied ? 'All mandatory verticals satisfied' : 'Min 5 SP needed in mandatory verticals'}
              </div>
            </div>

            {/* 4. Class Rank */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Class Rank</span>
                <Trophy size={19} color="#D97706" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
                #{rankInfo.rank} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {rankInfo.totalStudents}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                In {user.class_name || 'Class Section'}
              </div>
            </div>
          </div>

          {/* Verticals Progress Grid */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: '1.25rem' }}>
              Verticals Breakdown (V1 – V10)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {(scores.verticals || []).map(v => {
                const percent = Math.min(100, Math.round((v.total_sp / v.extended_max_sp) * 100));
                return (
                  <div key={v.vertical_id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand-blue)' }}>{v.code}</span>
                      <span className={`badge badge-${v.type.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{v.type}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <span>Earned: <strong>{v.total_sp} SP</strong></span>
                      <span>Max: {v.extended_max_sp} SP</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: v.type === 'Mandatory' && !v.is_mandatory_satisfied ? '#D97706' : 'var(--brand-green)', borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Submissions Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                Recent Certificate Submissions
              </h3>
              <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                <PlusCircle size={15} /> Submit Proof
              </button>
            </div>

            {recentCertificates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No certificates submitted yet. Click "Submit Activity Proof" to earn Star Points!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Vertical</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Activity</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Level</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Claimed SP</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Submitted Date</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCertificates.map(c => (
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
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => setSelectedCertificate(c)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          >
                            <Eye size={14} /> View Proof
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

      {/* Proof Viewer Modal */}
      {selectedCertificate && (
        <ProofViewerModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <CertificateSubmitModal
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={fetchDashboardData}
        />
      )}
    </div>
  );
}
