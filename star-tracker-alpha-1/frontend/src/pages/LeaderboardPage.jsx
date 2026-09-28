import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trophy, Medal, Award, Flame, Search, Crown, AlertTriangle, TrendingDown, ArrowDown } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all' | 'top10' | 'bottom10'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');

  const isHod = user?.role === 'hod' || user?.role === 'dean' || user?.role === 'principal';

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchLeaderboard(selectedClassId, selectedYear);
  }, [selectedClassId, selectedYear]);

  const fetchLeaderboard = async (classId, year) => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard({ 
        class_id: classId || undefined, 
        year: year ? parseInt(year, 10) : undefined 
      });
      setLeaderboard(data?.leaderboard || []);
      if (data?.classes && classes.length === 0) {
        setClasses(data.classes);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = leaderboard.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.reg_no_emp_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(search.toLowerCase())
  );

  const bottom10 = useMemo(() => {
    if (!filtered || filtered.length === 0) return [];
    // Sort ascending by total_sp to get lowest 10 students
    return [...filtered].sort((a, b) => (a.total_sp || 0) - (b.total_sp || 0)).slice(0, 10);
  }, [filtered]);

  const displayedStudents = useMemo(() => {
    if (viewFilter === 'top10') {
      return filtered.slice(0, 10);
    }
    if (viewFilter === 'bottom10') {
      return bottom10;
    }
    return filtered;
  }, [filtered, viewFilter, bottom10]);

  const userRole = user?.role || 'student';

  // Filter classes according to selectedYear if any
  const availableClasses = classes.filter(c => {
    if (!selectedYear) return true;
    const yr = String(selectedYear);
    if (yr === '1' && (c.name.startsWith('I ') || c.name.startsWith('1st'))) return true;
    if (yr === '2' && (c.name.startsWith('II ') || c.name.startsWith('2nd'))) return true;
    if (yr === '3' && (c.name.startsWith('III ') || c.name.startsWith('3rd'))) return true;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole={userRole} role={userRole} />
        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Page Header for HOD */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge" style={{ background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', fontWeight: 800 }}>
                  {isHod ? 'DEPARTMENT LEADERBOARD' : 'INSTITUTION LEADERBOARD'}
                </span>
                {user?.department_name && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    • {user.department_name}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {isHod ? 'Department Student Standings' : 'Star Tracker Leaderboard'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                {isHod 
                  ? 'Recognizing top student performers within your department across Year 1, Year 2, and Year 3.' 
                  : 'Top student performers recognized across verticals, activities, and internal marks.'}
              </p>
            </div>

            {/* Year Selection Tabs (Prominent for HOD) */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              gap: '4px'
            }}>
              {[
                { id: '', label: 'All Years' },
                { id: '1', label: '1st Year' },
                { id: '2', label: '2nd Year' },
                { id: '3', label: '3rd Year' }
              ].map(tab => {
                const isActive = selectedYear === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedYear(tab.id);
                      setSelectedClassId(''); // reset class filter on year change
                    }}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? 'var(--brand-green)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 2px 8px rgba(32,142,71,0.25)' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by student name or roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* View Mode Toggle: All vs Top 10 vs Bottom 10 */}
                <div style={{
                  display: 'inline-flex',
                  background: 'var(--bg-secondary)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  gap: '2px'
                }}>
                  <button
                    onClick={() => setViewFilter('all')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: viewFilter === 'all' ? 700 : 500,
                      cursor: 'pointer',
                      background: viewFilter === 'all' ? 'var(--brand-blue)' : 'transparent',
                      color: viewFilter === 'all' ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    🏆 All Standings ({filtered.length})
                  </button>
                  <button
                    onClick={() => setViewFilter('top10')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: viewFilter === 'top10' ? 700 : 500,
                      cursor: 'pointer',
                      background: viewFilter === 'top10' ? 'var(--brand-green)' : 'transparent',
                      color: viewFilter === 'top10' ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    🥇 Top 10
                  </button>
                  <button
                    onClick={() => setViewFilter('bottom10')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: viewFilter === 'bottom10' ? 700 : 500,
                      cursor: 'pointer',
                      background: viewFilter === 'bottom10' ? '#EF4444' : 'transparent',
                      color: viewFilter === 'bottom10' ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    ⚠️ Bottom 10 ({bottom10.length})
                  </button>
                </div>

                {availableClasses.length > 0 && user?.role !== 'student' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Class:</span>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="form-select"
                      style={{ width: 'auto', minWidth: 180 }}
                    >
                      <option value="">{isHod ? 'All Department Classes' : 'Institution-Wide (All)'}</option>
                      {availableClasses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.section ? `- Sec ${c.section}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom 10 Alert Banner when Bottom 10 is active */}
          {viewFilter === 'bottom10' && (
            <div className="glass-card" style={{
              marginBottom: '1.5rem',
              padding: '1.25rem 1.5rem',
              borderLeft: '4px solid #EF4444',
              background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.08), transparent)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <AlertTriangle size={22} color="#EF4444" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#DC2626' }}>
                  Bottom 10 Students — Requires Academic Support & Point Boost
                </h3>
              </div>
              <p style={{ margin: '0.25rem 0 0 2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                These are the 10 students with the lowest Star Points currently recorded. Class advisors can target these students for mentoring and encouraging certificate submissions.
              </p>
            </div>
          )}

          {/* Top 3 Podium Cards (Shown for All or Top 10 view) */}
          {!loading && viewFilter !== 'bottom10' && leaderboard.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {/* Rank 2 - Silver */}
              <div className="glass-card" style={{ textAlign: 'center', borderTop: '4px solid #94A3B8' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(148, 163, 184, 0.15)', color: '#64748B', margin: '0 auto 0.75rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Medal size={28} />
                </div>
                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: 'rgba(148, 163, 184, 0.2)', color: '#475569', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  #2 SILVER
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>{leaderboard[1].name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{leaderboard[1].reg_no_emp_id}</p>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{leaderboard[1].total_sp} SP</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-green)', marginTop: 2 }}>{leaderboard[1].internal_marks_100} Marks Awarded</div>
                </div>
              </div>

              {/* Rank 1 - Champion Gold */}
              <div className="glass-card" style={{ textAlign: 'center', borderTop: '4px solid #F59E0B', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08), transparent)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.18)', color: '#D97706', margin: '0 auto 0.75rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Crown size={32} />
                </div>
                <span style={{ display: 'inline-block', padding: '2px 12px', borderRadius: 20, background: 'rgba(245, 158, 11, 0.25)', color: '#B45309', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  👑 #1 CHAMPION
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>{leaderboard[0].name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{leaderboard[0].reg_no_emp_id}</p>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#D97706' }}>{leaderboard[0].total_sp} SP</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-green)', marginTop: 2 }}>{leaderboard[0].internal_marks_100} Marks Awarded</div>
                </div>
              </div>

              {/* Rank 3 - Bronze */}
              <div className="glass-card" style={{ textAlign: 'center', borderTop: '4px solid #B45309' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(180, 83, 9, 0.15)', color: '#B45309', margin: '0 auto 0.75rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Medal size={28} />
                </div>
                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: 'rgba(180, 83, 9, 0.2)', color: '#92400E', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  #3 BRONZE
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>{leaderboard[2].name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{leaderboard[2].reg_no_emp_id}</p>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{leaderboard[2].total_sp} SP</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-green)', marginTop: 2 }}>{leaderboard[2].internal_marks_100} Marks Awarded</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Standings Table */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {viewFilter === 'bottom10' ? (
                    <>
                      <AlertTriangle size={18} color="#EF4444" />
                      <span>Bottom 10 Students (Needs Support & SP Boost)</span>
                    </>
                  ) : viewFilter === 'top10' ? (
                    <>
                      <Trophy size={18} color="#D97706" />
                      <span>Top 10 Star Performers</span>
                    </>
                  ) : (
                    <>
                      <Award size={18} color="var(--brand-blue)" />
                      <span>{isHod ? 'Department Standings Roster' : 'Institution Standings Roster'}</span>
                    </>
                  )}
                </h2>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {viewFilter === 'bottom10'
                    ? 'Showing 10 students with the lowest Star Points needing advisor guidance.'
                    : `Showing ${displayedStudents.length} student${displayedStudents.length === 1 ? '' : 's'} sorted by Star Points.`}
                </p>
              </div>

              {viewFilter !== 'all' && (
                <button
                  onClick={() => setViewFilter('all')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                >
                  View All Standings
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                <p>Loading Leaderboard Standings...</p>
              </div>
            ) : displayedStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Trophy size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No Students Found</h3>
                <p>No student standings match the filter.</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Rank</th>
                      <th style={{ padding: '0.75rem' }}>Student</th>
                      <th style={{ padding: '0.75rem' }}>Class</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Star Points (SP)</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Bonus SP</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Internal Mark (100)</th>
                      {viewFilter === 'bottom10' && (
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedStudents.map((s, idx) => {
                      const isMe = user?.id === s.id;
                      const isLow = (s.total_sp || 0) < 30;
                      return (
                        <tr 
                          key={s.id} 
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: isMe 
                              ? 'rgba(32,142,71,0.08)' 
                              : viewFilter === 'bottom10' && isLow 
                                ? 'rgba(239, 68, 68, 0.03)' 
                                : 'transparent',
                            fontWeight: isMe ? 700 : 'normal'
                          }}
                        >
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            {viewFilter === 'bottom10' ? (
                              <span style={{ fontWeight: 700, color: '#EF4444' }}>
                                #{s.rank || idx + 1}
                              </span>
                            ) : idx === 0 ? (
                              <span style={{ fontWeight: 800, color: '#D97706', fontSize: '1.1rem' }}>🥇 1</span>
                            ) : idx === 1 ? (
                              <span style={{ fontWeight: 800, color: '#64748B', fontSize: '1.1rem' }}>🥈 2</span>
                            ) : idx === 2 ? (
                              <span style={{ fontWeight: 800, color: '#B45309', fontSize: '1.1rem' }}>🥉 3</span>
                            ) : (
                              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{s.rank || idx + 1}</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {s.name} {isMe && <span style={{ fontSize: '0.75rem', color: 'var(--brand-green)', fontWeight: 700 }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.reg_no_emp_id}</div>
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {s.year && (
                                <span style={{
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  color: 'var(--brand-blue)',
                                  border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}>
                                  Yr {s.year}
                                </span>
                              )}
                              <span>{s.class_name ? `${s.class_name} - ${s.class_section || ''}` : '—'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: (s.total_sp || 0) < 20 ? '#EF4444' : 'var(--brand-green)' }}>
                            +{s.total_sp || 0} SP
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: '#D97706' }}>
                            {s.bonus_sp || 0} SP
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: 6,
                              fontWeight: 700,
                              background: (s.total_sp || 0) < 20 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(32,142,71,0.12)',
                              color: (s.total_sp || 0) < 20 ? '#EF4444' : 'var(--brand-green)',
                              border: `1px solid ${(s.total_sp || 0) < 20 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(32,142,71,0.25)'}`
                            }}>
                              {s.internal_marks_100 || 0} / 100
                            </span>
                          </td>
                          {viewFilter === 'bottom10' && (
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.25)'
                              }}>
                                <ArrowDown size={12} /> Needs Support
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Dedicated Bottom 10 Summary Card when viewing All Standings */}
          {viewFilter === 'all' && bottom10.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem', borderTop: '3px solid #EF4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} color="#EF4444" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Bottom 10 Students (Requires Mentoring & Support)
                  </h3>
                </div>
                <button
                  onClick={() => setViewFilter('bottom10')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Focus on Bottom 10 →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {bottom10.slice(0, 10).map((s) => (
                  <div 
                    key={s.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '0.85rem',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444' }}>
                          Rank #{s.rank || '—'}
                        </span>
                        {s.year && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Yr {s.year}
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.reg_no_emp_id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {s.class_name ? `${s.class_name} ${s.class_section ? `- ${s.class_section}` : ''}` : '—'}
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#EF4444' }}>
                        {s.total_sp || 0} SP
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {s.internal_marks_100 || 0} Marks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
