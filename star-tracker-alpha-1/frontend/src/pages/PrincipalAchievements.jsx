import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Award, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink,
  Layers,
  Building2,
  Calendar,
  X
} from 'lucide-react';

export default function PrincipalAchievements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSchoolId = searchParams.get('school_id') || '';
  const initialDeptId = searchParams.get('department_id') || '';

  const [achievements, setAchievements] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [verticals, setVerticals] = useState([]);
  
  const [selectedSchool, setSelectedSchool] = useState(initialSchoolId);
  const [selectedDept, setSelectedDept] = useState(initialDeptId);
  const [selectedVertical, setSelectedVertical] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchAchievements();
  }, [page, selectedSchool, selectedDept, selectedVertical, selectedStatus]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: 20,
      };
      if (selectedSchool) params.school_id = selectedSchool;
      if (selectedDept) params.department_id = selectedDept;
      if (selectedVertical) params.vertical_id = selectedVertical;
      if (selectedStatus) params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await api.getPrincipalAchievements(params);
      setAchievements(res.achievements || []);
      setTotalPages(res.total_pages || 1);
      setTotalRecords(res.total || 0);
      if (res.schools && res.schools.length > 0) setSchools(res.schools);
      if (res.departments && res.departments.length > 0) setDepartments(res.departments);
      if (res.verticals && res.verticals.length > 0) setVerticals(res.verticals);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAchievements();
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
                  background: 'rgba(139, 92, 246, 0.12)',
                  padding: '0.45rem',
                  borderRadius: 8,
                  color: '#8b5cf6'
                }}>
                  <Award size={22} />
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  College-Wide Achievements
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Monitoring verified activities and star points logged across all college schools
              </p>
            </div>

            <button
              onClick={() => { setPage(1); fetchAchievements(); }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {/* School Filter */}
              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  setSelectedDept('');
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
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
                  padding: '0.5rem 0.75rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  maxWidth: 200
                }}
              >
                <option value="">All Programmes</option>
                {filteredDepts.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>

              {/* Vertical Filter */}
              <select
                value={selectedVertical}
                onChange={(e) => {
                  setSelectedVertical(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                <option value="">All Verticals</option>
                {verticals.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search student, activity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.5rem 0.85rem 0.5rem 2.25rem',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    width: 200
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #208e47 0%, #2b4d91 100%)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Filter
              </button>
            </form>
          </div>

          {/* Achievements Table */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Student</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>School / Dept</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Activity / Category</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Vertical</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Points</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Date</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading achievements...
                      </td>
                    </tr>
                  ) : achievements.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No achievement records found.
                      </td>
                    </tr>
                  ) : (
                    achievements.map((ach) => (
                      <tr
                        key={ach.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {ach.student_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {ach.register_number}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            {ach.department_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#208e47', fontWeight: 600 }}>
                            {ach.school_name}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {ach.category_name}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            background: 'rgba(43, 77, 145, 0.08)',
                            color: '#2b4d91',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 6
                          }}>
                            {ach.vertical_name}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#208e47' }}>
                          +{ach.points} SP
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          {ach.status === 'approved' ? (
                            <span style={{
                              background: 'rgba(32, 142, 71, 0.12)',
                              color: '#208e47',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.55rem',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <CheckCircle2 size={13} /> Approved
                            </span>
                          ) : ach.status === 'pending' ? (
                            <span style={{
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: '#f59e0b',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.55rem',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Clock size={13} /> Pending
                            </span>
                          ) : (
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#ef4444',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.55rem',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <XCircle size={13} /> Rejected
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {ach.created_at ? new Date(ach.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedAchievement(ach)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: 'transparent',
                              border: '1px solid var(--border-color)',
                              borderRadius: 6,
                              color: '#2b4d91',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  Showing page {page} of {totalPages} ({totalRecords} achievements)
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

          {/* Achievement Modal */}
          {selectedAchievement && (
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
                maxWidth: 520,
                width: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Achievement Details
                  </h3>
                  <button
                    onClick={() => setSelectedAchievement(null)}
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
                    <span style={{ color: 'var(--text-secondary)' }}>Student:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedAchievement.student_name} ({selectedAchievement.register_number})</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>School:</span>
                    <span style={{ color: '#208e47', fontWeight: 600 }}>{selectedAchievement.school_name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Programme:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedAchievement.department_name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Activity Category:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedAchievement.category_name}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vertical:</span>
                    <span style={{ color: '#2b4d91', fontWeight: 600 }}>{selectedAchievement.vertical_name}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Star Points Awarded:</span>
                    <span style={{ color: '#208e47', fontWeight: 800, fontSize: '1.1rem' }}>+{selectedAchievement.points} SP</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                    <strong style={{ textTransform: 'capitalize', color: selectedAchievement.status === 'approved' ? '#208e47' : '#f59e0b' }}>
                      {selectedAchievement.status}
                    </strong>
                  </div>

                  {selectedAchievement.description && (
                    <div style={{ paddingTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Description / Remarks:</span>
                      <div style={{ background: 'var(--bg-primary)', padding: '0.6rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {selectedAchievement.description}
                      </div>
                    </div>
                  )}

                  {selectedAchievement.certificate_url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a
                        href={selectedAchievement.certificate_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#2b4d91',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={15} /> View Uploaded Certificate
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setSelectedAchievement(null)}
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
