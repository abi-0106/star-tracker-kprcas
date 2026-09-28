import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Search, 
  Building, 
  AlertTriangle, 
  ArrowDown, 
  RefreshCw 
} from 'lucide-react';

export default function DeanLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all' | 'top10' | 'bottom10'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDeptId, selectedClassId, selectedYear]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard({
        class_id: selectedClassId || undefined,
        year: selectedYear ? parseInt(selectedYear, 10) : undefined
      });
      let list = data?.leaderboard || [];
      if (selectedDeptId) {
        list = list.filter(s => String(s.department_id || '') === String(selectedDeptId) || s.department_name === selectedDeptId);
      }
      setLeaderboard(list);
      if (data?.classes && classes.length === 0) setClasses(data.classes);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load departments list for filtering
  useEffect(() => {
    api.getClasses().then(clsList => {
      if (clsList && Array.isArray(clsList)) setClasses(clsList);
    }).catch(() => {});
    api.getDeanDepartments().then(res => {
      if (res?.departments) setDepartments(res.departments);
    }).catch(() => {});
  }, []);

  const filtered = leaderboard.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.reg_no_emp_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.department_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(search.toLowerCase())
  );

  const bottom10 = useMemo(() => {
    if (!filtered || filtered.length === 0) return [];
    return [...filtered].sort((a, b) => (a.total_sp || 0) - (b.total_sp || 0)).slice(0, 10);
  }, [filtered]);

  const displayedStudents = useMemo(() => {
    if (viewFilter === 'top10') return filtered.slice(0, 10);
    if (viewFilter === 'bottom10') return bottom10;
    return filtered;
  }, [filtered, viewFilter, bottom10]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="dean" role="dean" />

        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1440, width: '100%' }}>
          
          {/* Header */}
          <div style={{ 
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', fontWeight: 800 }}>
                  INSTITUTIONAL RANKINGS
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  • Star Tracker Leaderboard
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Institution-Wide Student Leaderboard
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                Recognizing top student performers and monitoring academic participation across all departments.
              </p>
            </div>

            {/* Year Selector Tabs */}
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
                    onClick={() => { setSelectedYear(tab.id); setSelectedClassId(''); }}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      background: isActive ? 'var(--brand-blue)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Department & View Filter Bar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search student or roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', height: 38 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                
                {/* View Tabs */}
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

                {/* Department Filter */}
                {departments.length > 0 && (
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="form-select"
                    style={{ height: 38, fontSize: '0.82rem', minWidth: 170 }}
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Top 3 Champion Podium Cards (Shown in All or Top 10) */}
          {!loading && viewFilter !== 'bottom10' && filtered.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              
              {/* Rank 2 - Silver */}
              <div className="glass-card" style={{ textAlign: 'center', borderTop: '4px solid #94A3B8' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(148, 163, 184, 0.15)', color: '#64748B', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Medal size={28} />
                </div>
                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: 'rgba(148, 163, 184, 0.2)', color: '#475569', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  #2 SILVER
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>{filtered[1].name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                  {filtered[1].reg_no_emp_id} • {filtered[1].department_name}
                </p>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{filtered[1].total_sp} SP</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-green)', marginTop: 2 }}>{filtered[1].internal_marks_100} Marks Awarded</div>
                </div>
              </div>

              {/* Rank 1 - Champion Gold */}
              <div className="glass-card" style={{ textAlign: 'center', borderTop: '4px solid #F59E0B', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08), transparent)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.18)', color: '#D97706', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Crown size={32} />
                </div>
                <span style={{ display: 'inline-block', padding: '2px 12px', borderRadius: 20, background: 'rgba(245, 158, 11, 0.25)', color: '#B45309', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  👑 #1 CHAMPION
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>{filtered[0].name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                  {filtered[0].reg_no_emp_id} • {filtered[0].department_name}
                </p>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#D97706' }}>{filtered[0].total_sp} SP</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-green)', marginTop: 2 }}>{filtered[0].internal_marks_100} Marks Awarded</div>
                </div>
              </div>

              {/* Rank 3 - Bronze */}
              <div className="glass-card" style={{ textAlign: 'center', borderTop: '4px solid #B45309' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(180, 83, 9, 0.15)', color: '#B45309', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Medal size={28} />
                </div>
                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: 'rgba(180, 83, 9, 0.2)', color: '#92400E', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  #3 BRONZE
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>{filtered[2].name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                  {filtered[2].reg_no_emp_id} • {filtered[2].department_name}
                </p>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{filtered[2].total_sp} SP</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-green)', marginTop: 2 }}>{filtered[2].internal_marks_100} Marks Awarded</div>
                </div>
              </div>
            </div>
          )}

          {/* Standings Table */}
          <div className="glass-card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {viewFilter === 'bottom10' ? (
                  <>
                    <AlertTriangle size={18} color="#EF4444" />
                    <span>Bottom 10 Students (Needs Support & Acceleration)</span>
                  </>
                ) : (
                  <>
                    <Award size={18} color="var(--brand-blue)" />
                    <span>Institutional Standings Roster</span>
                  </>
                )}
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {displayedStudents.length} Students Listed
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'center', width: 60 }}>Rank</th>
                      <th style={{ padding: '0.75rem' }}>Student</th>
                      <th style={{ padding: '0.75rem' }}>Department</th>
                      <th style={{ padding: '0.75rem' }}>Class & Year</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Star Points</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Internal Marks</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedStudents.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {viewFilter === 'bottom10' ? (
                            <span style={{ fontWeight: 700, color: '#EF4444' }}>#{s.rank || idx + 1}</span>
                          ) : idx === 0 ? (
                            <span style={{ fontWeight: 800, color: '#D97706', fontSize: '1.05rem' }}>🥇 1</span>
                          ) : idx === 1 ? (
                            <span style={{ fontWeight: 800, color: '#64748B', fontSize: '1.05rem' }}>🥈 2</span>
                          ) : idx === 2 ? (
                            <span style={{ fontWeight: 800, color: '#B45309', fontSize: '1.05rem' }}>🥉 3</span>
                          ) : (
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{s.rank || idx + 1}</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.reg_no_emp_id}</div>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {s.department_name || '—'}
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {s.year && (
                              <span style={{ padding: '1px 5px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(43,77,145,0.1)', color: 'var(--brand-blue)' }}>
                                Yr {s.year}
                              </span>
                            )}
                            <span>{s.class_name ? `${s.class_name} ${s.class_section ? `- ${s.class_section}` : ''}` : '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: (s.total_sp || 0) < 20 ? '#EF4444' : 'var(--brand-green)' }}>
                          +{s.total_sp || 0} SP
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700 }}>
                          {s.internal_marks_100 || 0} / 100
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
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

        </main>
      </div>
    </div>
  );
}
