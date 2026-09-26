import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import StudentGalleryModal from '../components/StudentGalleryModal';
import { Building2, Users, Award, Eye, Layers, Trophy, Mail, Phone, BookOpen, Clock, Folder, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export default function HodDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [inspectClassId, setInspectClassId] = useState(null);
  const [inspectedClassData, setInspectedClassData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [selectedGalleryStudentId, setSelectedGalleryStudentId] = useState(null);

  const fetchHodData = () => {
    setLoading(true);
    api.getHodDashboard()
      .then(resData => {
        setData(resData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHodData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleInspectAdvisor = (classId) => {
    setInspectClassId(classId);
    setInspectLoading(true);
    api.getAdvisorDashboard(classId)
      .then(cData => {
        setInspectedClassData(cData);
      })
      .catch(err => console.error(err))
      .finally(() => setInspectLoading(false));
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const { 
    department = {}, 
    stats = { totalStudents: 0, totalAdvisors: 0, deptAvgSP: 0, deptTotalSP: 0 }, 
    classes = [], 
    advisors = [], 
    verticalBreakdown = [], 
    topStudents = [] 
  } = data;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="hod" />

        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Header Banner */}
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>HOD DEPARTMENT DASHBOARD</span>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>
                  {department?.name || 'School of IT Integrated Commerce'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Department Code: <strong>{department?.code || 'SoITC'}</strong> &bull; Total Enrolled Students: <strong>{stats.totalStudents}</strong>
                </p>
              </div>

              <ExportButton
                buttonText="Export Department Report"
                getExportOptions={() => ({
                  title: `${department?.name || 'Department'} Performance Summary`,
                  department: department?.name,
                  fileName: `Department_Report_${department?.code || 'SoITC'}`,
                  columns: [
                    { header: 'Class Name', key: 'name' },
                    { header: 'Section', key: 'section' },
                    { header: 'Batch', key: 'batch_year' },
                    { header: 'Class Advisor', key: 'advisor_name' },
                    { header: 'Student Count', key: 'student_count' },
                    { header: 'Average SP', key: 'avg_sp', formatter: val => `${val} SP` },
                    { header: 'Pending Submissions', key: 'pending_count' },
                  ],
                  data: classes,
                })}
              />
            </div>
          </div>

          {/* Department Overview Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.15rem', marginBottom: '2rem' }}>
            {/* 1. Total Students */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Students</span>
                <Users size={19} color="var(--brand-blue)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1.1 }}>{stats.totalStudents}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Across {classes.length} class sections</div>
            </div>

            {/* 2. Class Advisors */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Class Advisors</span>
                <BookOpen size={19} color="var(--brand-green)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>{stats.totalAdvisors}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Faculty sections assigned</div>
            </div>

            {/* 3. Department Avg SP */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Department Avg SP</span>
                <Award size={19} color="var(--brand-green)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>
                {stats.deptAvgSP} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SP</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Avg Mark: {(stats.deptAvgSP / 2).toFixed(1)} / 100</div>
            </div>

            {/* 4. Cumulative Star Points */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Cumulative Star Points</span>
                <Trophy size={19} color="#D97706" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
                {stats.deptTotalSP} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SP</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Total department achievement</div>
            </div>

            {/* 5. Department Internal Marks Total */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Internal Marks</span>
                <TrendingUp size={19} color="#1E3870" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1E3870', lineHeight: 1.1 }}>
                {(stats.deptTotalSP / 2).toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Marks</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Conversion: 2 SP = 1 Mark</div>
            </div>

            {/* 6. Pending Review Queue */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Review Queue</span>
                <Clock size={19} color="#D97706" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
                {classes.reduce((acc, c) => acc + Number(c.pending_count || 0), 0)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Awaiting advisor action</div>
            </div>
          </div>

          {/* Class Section Cards */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: '1rem' }}>
              Class Sections & Advisor Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {classes.map(cls => (
                <div key={cls.id} style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
                      {cls.name} — Sec {cls.section}
                    </h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-green)' }}>{cls.batch_year}</span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Advisor: <strong>{cls.advisor_name || 'Not Assigned'}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.65rem', borderRadius: 8, textAlign: 'center', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Students</span>
                      <strong>{cls.student_count}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Avg SP</span>
                      <strong style={{ color: 'var(--brand-green)' }}>{cls.avg_sp} SP</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Pending</span>
                      <strong style={{ color: cls.pending_count > 0 ? '#D97706' : 'var(--text-muted)' }}>{cls.pending_count}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInspectAdvisor(cls.id)}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem' }}
                  >
                    <Eye size={14} /> Inspect Section Roster & Queue
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Inspected Section Drawer */}
          {inspectClassId && inspectedClassData && (
            <div className="glass-card" style={{ marginBottom: '2rem', border: '2px solid var(--brand-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
                  Inspecting: {inspectedClassData.classInfo?.name} — Section {inspectedClassData.classInfo?.section}
                </h3>
                <button onClick={() => { setInspectClassId(null); setInspectedClassData(null); }} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem' }}>
                  Close Inspector
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.65rem' }}>Reg No</th>
                      <th style={{ padding: '0.65rem' }}>Student Name</th>
                      <th style={{ padding: '0.65rem' }}>Total SP</th>
                      <th style={{ padding: '0.65rem' }}>Internal Marks (100)</th>
                      <th style={{ padding: '0.65rem' }}>Mandatory Rules</th>
                      <th style={{ padding: '0.65rem' }}>Gallery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inspectedClassData.students || []).map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{s.reg_no_emp_id}</td>
                        <td style={{ padding: '0.65rem', fontWeight: 600 }}>{s.name}</td>
                        <td style={{ padding: '0.65rem', fontWeight: 800, color: 'var(--brand-green)' }}>{s.total_sp} SP</td>
                        <td style={{ padding: '0.65rem', fontWeight: 700 }}>{s.internal_marks_100}</td>
                        <td style={{ padding: '0.65rem' }}>
                          <span className={`badge badge-${s.mandatory_satisfied ? 'approved' : 'pending'}`}>
                            {s.mandatory_satisfied ? 'Satisfied' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem' }}>
                          <button
                            onClick={() => setSelectedGalleryStudentId(s.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            <Folder size={13} /> View Gallery
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Students Department-Wide */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: '1rem' }}>
              Department Top Students
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.65rem' }}>Rank</th>
                    <th style={{ padding: '0.65rem' }}>Reg No</th>
                    <th style={{ padding: '0.65rem' }}>Student Name</th>
                    <th style={{ padding: '0.65rem' }}>Class</th>
                    <th style={{ padding: '0.65rem' }}>Total SP</th>
                    <th style={{ padding: '0.65rem' }}>Internal Mark</th>
                    <th style={{ padding: '0.65rem' }}>Gallery</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((s, idx) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</td>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{s.reg_no_emp_id}</td>
                      <td style={{ padding: '0.65rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '0.65rem', color: 'var(--text-secondary)' }}>{s.class_name} - {s.section}</td>
                      <td style={{ padding: '0.65rem', fontWeight: 800, color: 'var(--brand-green)' }}>{s.total_sp} SP</td>
                      <td style={{ padding: '0.65rem', fontWeight: 700 }}>{s.internal_marks_100} / 100</td>
                      <td style={{ padding: '0.65rem' }}>
                        <button
                          onClick={() => setSelectedGalleryStudentId(s.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <Folder size={13} /> Gallery
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
          onRefreshParent={fetchHodData}
        />
      )}
    </div>
  );
}
