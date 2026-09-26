import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudentGalleryModal from '../components/StudentGalleryModal';
import ExportButton from '../components/ExportButton';
import { Users, Search, Folder, Award } from 'lucide-react';
import { api } from '../services/api';

export default function AdvisorStudents() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [selectedGalleryStudentId, setSelectedGalleryStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = () => {
    setLoading(true);
    api.getAdvisorDashboard()
      .then(resData => {
        setData(resData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const students = data?.students || [];
  const classInfo = data?.classInfo;

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.reg_no_emp_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="advisor" />

        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1400, width: '100%' }}>
          <div style={{ 
            position: 'sticky', 
            top: 72, 
            zIndex: 35, 
            marginBottom: '1.5rem',
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            padding: '1.25rem 1.5rem',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem' 
          }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.35rem' }}>CLASS ROSTER</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--brand-blue)' }}>
                {classInfo ? `${classInfo.name} — Section ${classInfo.section} Students` : 'Class Student Roster'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                View complete student performance, total Star Points, converted internal marks, and achievement galleries.
              </p>
            </div>

            <ExportButton
              classId={classInfo?.id}
              buttonText="Export Full Roster"
              getExportOptions={() => ({
                title: `${classInfo?.name || 'Class'} Full Student Performance Roster`,
                className: `${classInfo?.name} - ${classInfo?.section}`,
                fileName: `Roster_${classInfo?.name || 'Students'}`,
                columns: [
                  { header: 'Register No', key: 'reg_no_emp_id' },
                  { header: 'Student Name', key: 'name' },
                  { header: 'Email', key: 'email' },
                  { header: 'Phone', key: 'phone' },
                  { header: 'Total SP', key: 'total_sp', formatter: val => `${val} SP` },
                  { header: 'Internal Mark (100)', key: 'internal_marks_100', formatter: val => `${val} / 100` },
                  { header: 'Mandatory Satisfied', key: 'mandatory_satisfied', formatter: val => val ? 'YES' : 'NO' },
                  { header: 'Approved Certs', key: 'approved_count' },
                ],
                data: filteredStudents,
              })}
            />
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search students by name or reg no..."
                  className="form-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{filteredStudents.length}</strong> students
              </span>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Rank</th>
                    <th style={{ padding: '0.75rem' }}>Reg No</th>
                    <th style={{ padding: '0.75rem' }}>Student Name</th>
                    <th style={{ padding: '0.75rem' }}>Contact</th>
                    <th style={{ padding: '0.75rem' }}>Total SP</th>
                    <th style={{ padding: '0.75rem' }}>Internal Mark (100)</th>
                    <th style={{ padding: '0.75rem' }}>Mandatory Rules</th>
                    <th style={{ padding: '0.75rem' }}>Submissions</th>
                    <th style={{ padding: '0.75rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{s.reg_no_emp_id}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <div>{s.email}</div>
                        <div>{s.phone}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--brand-green)' }}>{s.total_sp} SP</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{s.internal_marks_100} / 100</td>
                      <td style={{ padding: '0.75rem' }}>
                        {s.mandatory_satisfied ? (
                          <span className="badge badge-approved">Satisfied</span>
                        ) : (
                          <span className="badge badge-pending">Needs SP</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--brand-green)' }}>{s.approved_count} Approved</span>
                        {s.pending_count > 0 && <span style={{ color: '#D97706', marginLeft: 6 }}>({s.pending_count} Pending)</span>}
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

      {selectedGalleryStudentId && (
        <StudentGalleryModal
          studentId={selectedGalleryStudentId}
          onClose={() => setSelectedGalleryStudentId(null)}
          onRefreshParent={fetchStudents}
        />
      )}
    </div>
  );
}
