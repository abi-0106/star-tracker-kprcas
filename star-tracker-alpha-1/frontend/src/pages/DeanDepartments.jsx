import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Building, 
  Users, 
  Award, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  RefreshCw,
  Trophy,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const COLORS = ['#208e47', '#2b4d91', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6366f1', '#14b8a6', '#f97316'];

export default function DeanDepartments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDeptId = searchParams.get('id') ? parseInt(searchParams.get('id'), 10) : null;

  const [school, setSchool] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(initialDeptId);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.getDeanDepartments();
      const list = res.departments || [];
      if (res.school) setSchool(res.school);
      setDepartments(list);
      if (!selectedDeptId && list.length > 0) {
        setSelectedDeptId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

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
                  {school ? `${school.name.toUpperCase()} (${school.code})` : 'SCHOOL PROGRAMMES OVERSIGHT'}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  • School Level Scope
                </span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Departments & Programmes Performance
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Showing all {departments.length} programmes under {school?.name || 'your assigned School'}. Compare departmental metrics, class sections, and student achievements.
              </p>
            </div>

            <button
              onClick={fetchDepartments}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Department Selection Pills / Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
            {departments.map((dept) => {
              const isSelected = selectedDept?.id === dept.id;
              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className="glass-card"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isSelected ? '2px solid var(--brand-blue)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(43,77,145,0.06)' : 'var(--bg-card)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    boxShadow: isSelected ? '0 6px 16px rgba(43,77,145,0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? 'var(--brand-blue)' : 'var(--text-muted)' }}>
                      {dept.code || `DEPT-${dept.id}`}
                    </span>
                    <Building size={16} color={isSelected ? 'var(--brand-blue)' : 'var(--text-muted)'} />
                  </div>
                  <h4 style={{ margin: '0.35rem 0 0.2rem', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {dept.name}
                  </h4>
                  {dept.hod_name && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      HOD: {dept.hod_name}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{dept.student_count} Students ({dept.classes?.length || 0} Sec)</span>
                    <strong style={{ color: 'var(--brand-green)' }}>{dept.total_sp} SP</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Department In-Depth Drilldown */}
          {selectedDept && (
            <div>
              {/* Department Header Banner */}
              <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--brand-blue)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-blue)', textTransform: 'uppercase' }}>
                      SELECTED DEPARTMENT
                    </span>
                    <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedDept.name}
                    </h2>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Code: {selectedDept.code || 'N/A'} • {selectedDept.classes?.length || 0} Class Sections • {selectedDept.student_count} Enrolled Students
                      {selectedDept.hod_name && (
                        <span> • HOD: <strong>{selectedDept.hod_name}</strong> {selectedDept.hod_email ? `(${selectedDept.hod_email})` : ''}</span>
                      )}
                    </p>
                  </div>

                  {/* Benchmark Badges */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(32,142,71,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-green)' }}>AVERAGE SP</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-green)' }}>{selectedDept.avg_sp} SP</div>
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1' }}>PARTICIPATION</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1' }}>{selectedDept.participation_rate}%</div>
                    </div>
                    <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b' }}>PENDING QUEUE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{selectedDept.pending_count}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Sections Breakdown & Vertical Distribution Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                
                {/* Classes in Department Table */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Class Sections Performance
                  </h3>

                  {(!selectedDept.classes || selectedDept.classes.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No classes registered under this department.</p>
                  ) : (
                    <div className="table-container">
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '0.5rem' }}>Class Section</th>
                            <th style={{ padding: '0.5rem' }}>Faculty Advisor</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Students</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Total SP</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Avg SP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDept.classes.map((cls) => (
                            <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {cls.name} {cls.section ? `- Sec ${cls.section}` : ''}
                              </td>
                              <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-secondary)' }}>
                                {cls.advisor_name || 'Unassigned'}
                              </td>
                              <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>
                                {cls.student_count}
                              </td>
                              <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                                {cls.total_sp} SP
                              </td>
                              <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 700, color: 'var(--brand-blue)' }}>
                                {cls.avg_sp} SP
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Vertical Points Breakdown in this Department */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Vertical-Wise Star Points Distribution
                  </h3>

                  {(!selectedDept.vertical_breakdown || selectedDept.vertical_breakdown.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No vertical activity recorded for this department.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {selectedDept.vertical_breakdown.map((v, idx) => {
                        const maxSp = Math.max(...selectedDept.vertical_breakdown.map(x => x.total_sp), 1);
                        const pct = Math.round((v.total_sp / maxSp) * 100);
                        return (
                          <div key={v.id} style={{ fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                <strong style={{ color: COLORS[idx % COLORS.length] }}>{v.code}</strong>: {v.name}
                              </span>
                              <span style={{ fontWeight: 800, color: 'var(--brand-green)' }}>
                                {v.total_sp} SP
                              </span>
                            </div>
                            <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: COLORS[idx % COLORS.length] }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Top 5 Students in this Department */}
              <div className="glass-card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={18} color="#f59e0b" />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Top 5 Performers in {selectedDept.name}
                    </h3>
                  </div>
                </div>

                {(!selectedDept.top_students || selectedDept.top_students.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No student achievements found in this department.
                  </div>
                ) : (
                  <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'center', width: 60 }}>Rank</th>
                          <th style={{ padding: '0.75rem' }}>Student Name</th>
                          <th style={{ padding: '0.75rem' }}>Roll Number</th>
                          <th style={{ padding: '0.75rem' }}>Class Section</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total SP</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center' }}>Internal Marks</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDept.top_students.map((s, idx) => (
                          <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 800 }}>
                              {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                            </td>
                            <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {s.name}
                            </td>
                            <td style={{ padding: '0.65rem 0.75rem', color: 'var(--brand-blue)', fontWeight: 600 }}>
                              {s.reg_no_emp_id}
                            </td>
                            <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>
                              {s.class_name ? `${s.class_name} - ${s.section || ''}` : `Year ${s.year || 1}`}
                            </td>
                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                              +{s.total_sp} SP
                            </td>
                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                              {s.internal_marks_100} / 100
                            </td>
                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                              {s.mandatory_satisfied ? (
                                <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>Satisfied</span>
                              ) : (
                                <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>Needs SP</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
