import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudentGalleryModal from '../components/StudentGalleryModal';
import { api } from '../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  Award, 
  CheckCircle2, 
  Clock, 
  Folder, 
  RefreshCw, 
  Eye, 
  X,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function DeanStudents() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Master lists
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);

  // Inspection modal
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedGalleryStudentId, setSelectedGalleryStudentId] = useState(null);

  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchStudents();
  }, [page, deptFilter, classFilter, yearFilter, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getDeanStudents({
        search,
        department_id: deptFilter || undefined,
        class_id: classFilter || undefined,
        year: yearFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit
      });
      setStudents(res.students || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
      if (res.departments) setDepartments(res.departments);
      if (res.classes) setClasses(res.classes);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleInspectStudent = async (stId) => {
    setSelectedStudentId(stId);
    try {
      setDetailLoading(true);
      const res = await api.getDeanStudentDetail(stId);
      setStudentDetail(res);
    } catch (err) {
      console.error('Failed to load student detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeStudentModal = () => {
    setSelectedStudentId(null);
    setStudentDetail(null);
  };

  const availableClasses = classes.filter(c => {
    if (!deptFilter) return true;
    return String(c.department_id) === String(deptFilter);
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="dean" role="dean" />

        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1440, width: '100%' }}>
          
          {/* Header */}
          <div style={{ 
            marginBottom: '1.5rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge" style={{ background: 'rgba(43,77,145,0.12)', color: 'var(--brand-blue)', fontWeight: 800 }}>
                  INSTITUTION-WIDE STUDENT EXPLORER
                </span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Student Achievement & Points Roster
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Search, filter, and inspect academic milestones and certificate verifications across all departments.
              </p>
            </div>

            <button
              onClick={() => { setPage(1); fetchStudents(); }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name, roll no, or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input"
                  style={{ height: 38, paddingLeft: '2.2rem', fontSize: '0.82rem', width: '100%' }}
                />
              </div>

              {/* Department Filter */}
              <select
                value={deptFilter}
                onChange={e => { setDeptFilter(e.target.value); setClassFilter(''); setPage(1); }}
                className="form-select"
                style={{ height: 38, fontSize: '0.82rem', minWidth: 160 }}
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* Class Filter */}
              <select
                value={classFilter}
                onChange={e => { setClassFilter(e.target.value); setPage(1); }}
                className="form-select"
                style={{ height: 38, fontSize: '0.82rem', minWidth: 150 }}
              >
                <option value="">All Classes</option>
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.section ? `- Sec ${c.section}` : ''}</option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={e => { setYearFilter(e.target.value); setPage(1); }}
                className="form-select"
                style={{ height: 38, fontSize: '0.82rem', minWidth: 110 }}
              >
                <option value="">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="form-select"
                style={{ height: 38, fontSize: '0.82rem', minWidth: 130 }}
              >
                <option value="">All Statuses</option>
                <option value="satisfied">Satisfied</option>
                <option value="needs_sp">Needs SP</option>
                <option value="active">Active (SP &gt; 0)</option>
                <option value="zero">Zero SP</option>
              </select>

              <button type="submit" className="btn btn-primary" style={{ height: 38, fontSize: '0.82rem', padding: '0 1rem' }}>
                Search
              </button>

              {(search || deptFilter || classFilter || yearFilter || statusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setDeptFilter('');
                    setClassFilter('');
                    setYearFilter('');
                    setStatusFilter('');
                    setPage(1);
                  }}
                  className="btn btn-secondary"
                  style={{ height: 38, fontSize: '0.82rem', padding: '0 0.75rem' }}
                >
                  Reset
                </button>
              )}
            </form>
          </div>

          {/* Student Table */}
          <div className="glass-card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing <strong>{students.length}</strong> of <strong>{total}</strong> students
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--brand-blue)' }} />
                <p style={{ fontSize: '0.85rem' }}>Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>No Students Found</h3>
                <p style={{ fontSize: '0.82rem' }}>No student records matched the current search and filter criteria.</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'center', width: 60 }}>Rank</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Student</th>
                      <th style={{ padding: '0.75rem' }}>Department & Class</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total SP</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Internal Marks</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Approvals</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Mandatory</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>
                          #{s.rank}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--brand-blue)', fontWeight: 600 }}>{s.reg_no_emp_id}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{s.department_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {s.class_name ? `${s.class_name} - Sec ${s.class_section || ''}` : `Year ${s.year || 1}`}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                          +{s.total_sp} SP
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700 }}>
                          {s.internal_marks_100} / 100
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem' }}>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>{s.approved_count} app</span>
                          {s.pending_count > 0 && <span style={{ color: '#f59e0b', marginLeft: 4 }}>({s.pending_count} pend)</span>}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {s.mandatory_satisfied ? (
                            <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>Satisfied</span>
                          ) : (
                            <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>Needs SP</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleInspectStudent(s.id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                              title="View Academic Record"
                            >
                              <Eye size={12} />
                              <span>Profile</span>
                            </button>
                            <button
                              onClick={() => setSelectedGalleryStudentId(s.id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                              title="Inspect Proof Gallery"
                            >
                              <Folder size={12} />
                              <span>Gallery</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total students)
                </span>
                
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', opacity: page === 1 ? 0.4 : 1 }}
                  >
                    Prev
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        style={{
                          minWidth: 28,
                          height: 28,
                          padding: '0 0.4rem',
                          borderRadius: 6,
                          fontSize: '0.78rem',
                          fontWeight: page === pageNum ? 800 : 500,
                          border: page === pageNum ? '1px solid var(--brand-blue)' : '1px solid var(--border-color)',
                          background: page === pageNum ? 'var(--brand-blue)' : 'var(--bg-card)',
                          color: page === pageNum ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', opacity: page === totalPages ? 0.4 : 1 }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Modal for Dean */}
          {selectedStudentId && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}>
              <div className="glass-card" style={{
                background: 'var(--bg-card)',
                width: '100%',
                maxWidth: 800,
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                position: 'relative'
              }}>
                <button
                  onClick={closeStudentModal}
                  style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={20} />
                </button>

                {detailLoading || !studentDetail ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--brand-blue)' }} />
                    <p>Loading student profile...</p>
                  </div>
                ) : (
                  <div>
                    {/* Header */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span className="badge" style={{ background: 'rgba(43,77,145,0.1)', color: 'var(--brand-blue)', fontWeight: 800 }}>
                        STUDENT ACADEMIC PROFILE
                      </span>
                      <h2 style={{ margin: '0.25rem 0 0.1rem', fontSize: '1.35rem', fontWeight: 800 }}>
                        {studentDetail.student.name}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Roll No: {studentDetail.student.reg_no_emp_id} • {studentDetail.student.department_name} • {studentDetail.student.class_name}
                      </p>
                    </div>

                    {/* Scores Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ background: 'rgba(32,142,71,0.08)', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-green)' }}>TOTAL SP</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-green)' }}>{studentDetail.scores.total_sp} SP</div>
                      </div>
                      <div style={{ background: 'rgba(43,77,145,0.08)', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-blue)' }}>INTERNAL MARKS</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{studentDetail.scores.internal_marks_100} / 100</div>
                      </div>
                      <div style={{ background: 'rgba(245,158,11,0.08)', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b' }}>BONUS SP</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{studentDetail.scores.bonus_sp || 0} SP</div>
                      </div>
                      <div style={{ background: 'rgba(99,102,241,0.08)', padding: '0.75rem', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1' }}>MANDATORY</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: studentDetail.scores.mandatory_satisfied ? 'var(--brand-green)' : '#f59e0b', marginTop: 2 }}>
                          {studentDetail.scores.mandatory_satisfied ? 'Satisfied' : 'Incomplete'}
                        </div>
                      </div>
                    </div>

                    {/* Achievements History */}
                    <div>
                      <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 800 }}>
                        Submitted Achievements History ({studentDetail.achievements?.length || 0})
                      </h4>
                      {(!studentDetail.achievements || studentDetail.achievements.length === 0) ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No achievements submitted yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 280, overflowY: 'auto' }}>
                          {studentDetail.achievements.map((a) => (
                            <div key={a.id} style={{
                              padding: '0.75rem',
                              borderRadius: 8,
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.8rem'
                            }}>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.activity_name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {a.vertical_code}: {a.vertical_name} • Level: {a.level_name || 'Standard'}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, color: 'var(--brand-green)' }}>+{a.claimed_sp} SP</div>
                                <span className={`badge badge-${a.status}`} style={{ fontSize: '0.65rem' }}>{a.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                      <button onClick={closeStudentModal} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Proof Gallery Modal */}
          {selectedGalleryStudentId && (
            <StudentGalleryModal
              studentId={selectedGalleryStudentId}
              onClose={() => setSelectedGalleryStudentId(null)}
            />
          )}

        </main>
      </div>
    </div>
  );
}
