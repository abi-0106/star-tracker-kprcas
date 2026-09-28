import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Building2, 
  Layers, 
  X,
  ExternalLink
} from 'lucide-react';

export default function PrincipalStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSchoolId = searchParams.get('school_id') || '';
  const initialDeptId = searchParams.get('department_id') || '';

  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(initialSchoolId);
  const [selectedDept, setSelectedDept] = useState(initialDeptId);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchStudents();
  }, [page, selectedSchool, selectedDept]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: 20,
      };
      if (selectedSchool) params.school_id = selectedSchool;
      if (selectedDept) params.department_id = selectedDept;
      if (search.trim()) params.search = search.trim();

      const res = await api.getPrincipalStudents(params);
      setStudents(res.students || []);
      setTotalPages(res.total_pages || 1);
      setTotalStudents(res.total || 0);
      if (res.schools && res.schools.length > 0) setSchools(res.schools);
      if (res.departments && res.departments.length > 0) setDepartments(res.departments);
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

  const filteredDepts = selectedSchool
    ? departments.filter(d => String(d.school_id) === String(selectedSchool))
    : departments;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="principal" role="principal" />

        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1440, width: '100%' }}>
          
          {/* Header */}
          <div style={{ 
            marginBottom: '1.75rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1.5rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{
                  background: 'rgba(14, 165, 233, 0.12)',
                  padding: '0.45rem',
                  borderRadius: 8,
                  color: '#0ea5e9'
                }}>
                  <Users size={22} />
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  College-Wide Student Roster
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Total {totalStudents.toLocaleString()} students across all 6 Academic Schools and 22 Programmes
              </p>
            </div>

            <button
              onClick={() => { setPage(1); fetchStudents(); }}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.9rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
              Refresh
            </button>
          </div>

          {/* Filters Bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* School Filter */}
              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  setSelectedDept('');
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                <option value="">All Schools</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  maxWidth: 240
                }}
              >
                <option value="">All Programmes</option>
                {filteredDepts.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search name or roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.5rem 0.85rem 0.5rem 2.25rem',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    width: 220
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #208e47 0%, #2b4d91 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Students Table */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Student</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Roll No</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>School</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Programme</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Class / Section</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Achievements</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Star Points</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading students...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No students found matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr
                        key={st.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.9rem 1.1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {st.full_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {st.email}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {st.register_number}
                        </td>
                        <td style={{ padding: '0.9rem 1.1rem' }}>
                          <span style={{
                            background: 'rgba(32, 142, 71, 0.08)',
                            color: '#208e47',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 6
                          }}>
                            {st.school_name}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1.1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {st.department_name}
                        </td>
                        <td style={{ padding: '0.9rem 1.1rem', color: 'var(--text-secondary)' }}>
                          {st.class_name || '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1.1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {st.achievements_count || 0}
                        </td>
                        <td style={{ padding: '0.9rem 1.1rem', textAlign: 'right', fontWeight: 700, color: '#208e47', fontSize: '0.95rem' }}>
                          {st.total_points || 0} SP
                        </td>
                        <td style={{ padding: '0.9rem 1.1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedStudent(st)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              background: 'transparent',
                              border: '1px solid var(--border-color)',
                              borderRadius: 6,
                              color: '#2b4d91',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-primary)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Showing page {page} of {totalPages} ({totalStudents} total students)
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.5 : 1
                    }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0 0.5rem' }}>
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.5 : 1
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Quick View Modal */}
          {selectedStudent && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 16,
                padding: '1.75rem',
                maxWidth: 480,
                width: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Student Information
                  </h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedStudent.full_name}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Register No:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedStudent.register_number}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>School:</span>
                    <span style={{ color: '#208e47', fontWeight: 600 }}>{selectedStudent.school_name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Programme:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedStudent.department_name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Class:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedStudent.class_name || '—'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Star Points:</span>
                    <span style={{ color: '#208e47', fontWeight: 800, fontSize: '1.05rem' }}>{selectedStudent.total_points || 0} SP</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Achievements:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{selectedStudent.achievements_count || 0}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: 'linear-gradient(135deg, #208e47 0%, #2b4d91 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
