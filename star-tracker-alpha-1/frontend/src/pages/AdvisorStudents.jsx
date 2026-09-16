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

        <main style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>CLASS ROSTER</span>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>
                {classInfo ? `${classInfo.name} — Section ${classInfo.section} Students` : 'Class Student Roster'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
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
                  { header: 'Bonus SP', key: 'bonus_sp', formatter: val => `${val} SP` },
                  { header: 'Internal Marks (100)', key: 'internal_marks_100' },
                  { header: 'Internal Marks (50)', key: 'internal_marks_50' },
                  { header: 'Mandatory Satisfied', key: 'mandatory_satisfied', formatter: val => val ? 'YES' : 'NO' },
                ],
                data: filteredStudents,
              })}
            />
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ position: 'relative', width: 300 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by student name or Reg No..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: 32, fontSize: '0.82rem' }}
                />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing <strong>{filteredStudents.length}</strong> students
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
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
