import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProofViewerModal from '../components/ProofViewerModal';
import StudentGalleryModal from '../components/StudentGalleryModal';
import ExportButton from '../components/ExportButton';
import { Users, Clock, CheckCircle2, Award, Eye, Search, Folder, FileText, CheckCircle, XCircle, ShieldCheck, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export default function AdvisorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedGalleryStudentId, setSelectedGalleryStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdvisorData = () => {
    setLoading(true);
    api.getAdvisorDashboard()
      .then(resData => {
        setData(resData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Class Advisor Portal...</p>
      </div>
    );
  }

  const { classInfo, stats = { totalStudents: 0, totalPending: 0, totalApproved: 0, avgSP: 0 }, pendingCertificates = [], reviewedCertificates = [], students = [] } = data;

  const filteredStudents = (students || []).filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.reg_no_emp_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="advisor" />

        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Header Banner */}
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>CLASS ADVISOR PORTAL</span>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>
                {classInfo ? `${classInfo.name} — Section ${classInfo.section}` : 'Class Advisor Portal'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Department: <strong>{classInfo?.department_name || 'SoITC'}</strong> &bull; Batch: <strong>{classInfo?.batch_year || '2024-2027'}</strong>
              </p>
            </div>

            <ExportButton
              classId={classInfo?.id}
              buttonText="Export Class Report (Excel)"
              getExportOptions={() => ({
                title: `${classInfo?.name || 'Class'} STAR Points & Internal Marks Report`,
                className: `${classInfo?.name} - ${classInfo?.section}`,
                fileName: `Class_STAR_Report_${classInfo?.name || 'Section'}`,
                columns: [
                  { header: 'Register No', key: 'reg_no_emp_id' },
                  { header: 'Student Name', key: 'name' },
                  { header: 'Total SP', key: 'total_sp', formatter: val => `${val} SP` },
                  { header: 'Bonus SP', key: 'bonus_sp', formatter: val => `${val} SP` },
                  { header: 'Internal Mark (100)', key: 'internal_marks_100' },
                  { header: 'Mandatory Satisfied', key: 'mandatory_satisfied', formatter: val => val ? 'YES' : 'NO' },
                  { header: 'Pending Submissions', key: 'pending_count' },
                ],
                data: students,
              })}
            />
          </div>

          {/* Metric Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.15rem', marginBottom: '2rem' }}>
            {/* 1. Total Students */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Students</span>
                <Users size={19} color="var(--brand-blue)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1.1 }}>{stats.totalStudents}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Assigned to class section</div>
            </div>

            {/* 2. Pending Review */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pending Review</span>
                <Clock size={19} color="#D97706" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>{stats.totalPending}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Awaiting verification</div>
            </div>

            {/* 3. Approved Proofs */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Approved Proofs</span>
                <CheckCircle2 size={19} color="var(--brand-green)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>{stats.totalApproved}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Verified achievements</div>
            </div>

            {/* 4. Class Average SP */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Class Average SP</span>
                <Award size={19} color="var(--brand-green)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>
                {stats.avgSP} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SP</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Avg Internal: {(stats.avgSP / 2).toFixed(1)} / 100</div>
            </div>
          </div>

          {/* Pending Verification Queue Box */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                Pending Review Queue ({pendingCertificates.length})
              </h3>
            </div>

            {pendingCertificates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} color="var(--brand-green)" style={{ margin: '0 auto 0.5rem' }} />
                <p>All caught up! No pending certificate submissions for review.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>Student</th>
                      <th style={{ padding: '0.75rem' }}>Vertical & Activity</th>
                      <th style={{ padding: '0.75rem' }}>Level</th>
                      <th style={{ padding: '0.75rem' }}>Claimed SP</th>
                      <th style={{ padding: '0.75rem' }}>Submitted</th>
                      <th style={{ padding: '0.75rem' }}>Review Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCertificates.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700 }}>{c.student_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.student_reg_no}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>{c.vertical_code}: </span>
                          <span>{c.activity_name}</span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{c.level_name}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--brand-green)' }}>+{c.claimed_sp} SP</td>
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

          {/* Student Roster Table */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                Class Student Roster ({filteredStudents.length})
              </h3>
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search student by name or Reg No..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: 32, fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Reg No</th>
                    <th style={{ padding: '0.75rem' }}>Student Name</th>
                    <th style={{ padding: '0.75rem' }}>Total SP</th>
                    <th style={{ padding: '0.75rem' }}>Internal Mark (100)</th>
                    <th style={{ padding: '0.75rem' }}>Mandatory Rules</th>
                    <th style={{ padding: '0.75rem' }}>Pending Proofs</th>
                    <th style={{ padding: '0.75rem' }}>Gallery</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{s.reg_no_emp_id}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--brand-green)' }}>{s.total_sp} SP</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{s.internal_marks_100} / 100</td>
                      <td style={{ padding: '0.75rem' }}>
                        {s.mandatory_satisfied ? (
                          <span className="badge badge-approved">Satisfied</span>
                        ) : (
                          <span className="badge badge-pending">Needs SP</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {s.pending_count > 0 ? (
                          <span className="badge badge-pending">{s.pending_count} Pending</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => setSelectedGalleryStudentId(s.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        >
                          <Folder size={14} /> Gallery
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Proof Reviewer Modal */}
      {selectedCertificate && (
        <ProofViewerModal
          certificate={selectedCertificate}
          isReviewer={true}
          onClose={() => setSelectedCertificate(null)}
          onReviewSubmitted={fetchAdvisorData}
        />
      )}

      {/* Student Gallery Modal */}
      {selectedGalleryStudentId && (
        <StudentGalleryModal
          studentId={selectedGalleryStudentId}
          onClose={() => setSelectedGalleryStudentId(null)}
          onRefreshParent={fetchAdvisorData}
        />
      )}
    </div>
  );
}
