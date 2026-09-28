import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import StudentGalleryModal from '../components/StudentGalleryModal';
import { Building2, Users, Award, Eye, Layers, Trophy, Mail, Phone, BookOpen, Clock, Folder, TrendingUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { api } from '../services/api';

export default function HodDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [inspectClassId, setInspectClassId] = useState(null);
  const [inspectedClassData, setInspectedClassData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [selectedGalleryStudentId, setSelectedGalleryStudentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [studentSearch, setStudentSearch] = useState('');

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

          {/* Department Overview Metric Cards (Single Line on Desktop) */}
          <div className="hod-kpi-grid">
            {/* 1. Total Students */}
            <div className="glass-card hod-kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Students</span>
                <Users size={18} color="var(--brand-blue)" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1.1 }}>{stats.totalStudents}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Across {classes.length} class sections</div>
            </div>

            {/* 2. Class Advisors */}
            <div className="glass-card hod-kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Class Advisors</span>
                <BookOpen size={18} color="var(--brand-green)" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>{stats.totalAdvisors}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Faculty sections assigned</div>
            </div>

            {/* 3. Department Avg SP */}
            <div className="glass-card hod-kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Department Avg SP</span>
                <Award size={18} color="var(--brand-green)" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>
                {stats.deptAvgSP} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SP</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Avg Mark: {(stats.deptAvgSP / 2).toFixed(1)} / 100</div>
            </div>

            {/* 4. Cumulative Star Points */}
            <div className="glass-card hod-kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cumulative SP</span>
                <Trophy size={18} color="#D97706" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
                {stats.deptTotalSP} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SP</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total dept achievement</div>
            </div>

            {/* 5. Department Internal Marks Total */}
            <div className="glass-card hod-kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Internal Marks</span>
                <TrendingUp size={18} color="#1E3870" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1E3870', lineHeight: 1.1 }}>
                {(stats.deptTotalSP / 2).toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marks</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>2 SP = 1 Mark</div>
            </div>

            {/* 6. Pending Review Queue */}
            <div className="glass-card hod-kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Review Queue</span>
                <Clock size={18} color="#D97706" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
                {classes.reduce((acc, c) => acc + Number(c.pending_count || 0), 0)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Awaiting advisor action</div>
            </div>
          </div>

          {/* Top Students Department-Wide with Page Navigation */}
          {(() => {
            const rankedStudents = (topStudents || []).map((s, idx) => ({
              ...s,
              rank: idx + 1
            }));

            const filteredStudents = rankedStudents.filter(s => {
              const q = studentSearch.toLowerCase().trim();
              if (!q) return true;
              const name = (s.name || '').toLowerCase();
              const reg = (s.reg_no_emp_id || '').toLowerCase();
              const className = (s.class_name || '').toLowerCase();
              const section = (s.section || '').toLowerCase();
              return name.includes(q) || reg.includes(q) || className.includes(q) || section.includes(q);
            });

            const effectivePageSize = pageSize === 0 ? (filteredStudents.length || 1) : pageSize;
            const totalPages = Math.ceil(filteredStudents.length / effectivePageSize) || 1;
            const activePage = Math.min(Math.max(1, currentPage), totalPages);
            const startIndex = (activePage - 1) * effectivePageSize;
            const paginatedStudents = pageSize === 0 ? filteredStudents : filteredStudents.slice(startIndex, startIndex + effectivePageSize);

            return (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                      Department Top Students
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Student leader ranking based on verified cumulative Star Points
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search student or reg no..."
                        value={studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: '0.4rem 0.65rem 0.4rem 1.85rem',
                          borderRadius: 8,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          width: 200
                        }}
                      />
                    </div>

                    {/* Page Size Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: '0.35rem 0.5rem',
                          borderRadius: 6,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={0}>All</option>
                      </select>
                    </div>
                  </div>
                </div>

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
                        <th style={{ padding: '0.65rem', textAlign: 'center' }}>Gallery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No student records found matching "{studentSearch}"
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((s) => (
                          <tr 
                            key={s.id} 
                            style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '0.65rem', fontWeight: 700, color: s.rank <= 3 ? '#208e47' : 'var(--text-muted)' }}>
                              #{s.rank}
                            </td>
                            <td style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{s.reg_no_emp_id}</td>
                            <td style={{ padding: '0.65rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                            <td style={{ padding: '0.65rem', color: 'var(--text-secondary)' }}>
                              {s.class_name ? `${s.class_name} - ${s.section || 'A'}` : '—'}
                            </td>
                            <td style={{ padding: '0.65rem', fontWeight: 800, color: 'var(--brand-green)' }}>{s.total_sp} SP</td>
                            <td style={{ padding: '0.65rem', fontWeight: 700 }}>{s.internal_marks_100} / 100</td>
                            <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                              <button
                                onClick={() => setSelectedGalleryStudentId(s.id)}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <Folder size={13} /> Gallery
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Page Navigation Bar */}
                {filteredStudents.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    marginTop: '0.85rem',
                    borderTop: '1px solid var(--border-color)',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Showing <strong>{filteredStudents.length === 0 ? 0 : startIndex + 1}</strong> to <strong>{Math.min(startIndex + effectivePageSize, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong> students
                    </span>

                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {/* Prev Button */}
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={activePage === 1}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 6,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: activePage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                            opacity: activePage === 1 ? 0.5 : 1
                          }}
                        >
                          <ChevronLeft size={14} /> Prev
                        </button>

                        {/* Numbered Page Buttons */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          const isActive = pageNum === activePage;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              style={{
                                minWidth: 28,
                                height: 28,
                                padding: '0 0.4rem',
                                borderRadius: 6,
                                border: `1px solid ${isActive ? '#208e47' : 'var(--border-color)'}`,
                                background: isActive ? 'linear-gradient(135deg, #208e47 0%, #2b4d91 100%)' : 'var(--bg-primary)',
                                color: isActive ? '#ffffff' : 'var(--text-primary)',
                                fontSize: '0.78rem',
                                fontWeight: isActive ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {/* Next Button */}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={activePage === totalPages}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 6,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-primary)',
                            color: activePage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: activePage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: activePage === totalPages ? 0.5 : 1
                          }}
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
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
