import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trophy, Medal, Award, Flame, Search, Crown } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchLeaderboard(selectedClassId);
  }, [selectedClassId]);

  const fetchLeaderboard = async (classId) => {
    try {
      setLoading(true);
      const data = await api.getLeaderboard(classId);
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

  const exportData = filtered.map((s, idx) => ({
    'Rank': s.rank || (idx + 1),
    'Roll Number': s.reg_no_emp_id,
    'Student Name': s.name,
    'Class': s.class_name ? `${s.class_name} - ${s.class_section || ''}` : 'N/A',
    'Star Points (SP)': s.total_sp || 0,
    'Bonus SP': s.bonus_sp || 0,
    'Internal Marks (2 SP = 1 Mark)': s.internal_marks_100 || 0,
    'Mandatory Satisfied': s.mandatory_satisfied ? 'YES' : 'NO'
  }));

  const userRole = user?.role || 'student';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole={userRole} role={userRole} />
        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Search, Filter & Actions Bar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search leaderboard by student name or roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {classes.length > 0 && user?.role !== 'student' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Class:</span>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="form-select"
                      style={{ width: 'auto', minWidth: 180 }}
                    >
                      <option value="">Institution-Wide (All)</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.section ? `- Sec ${c.section}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <ExportButton 
                  buttonText="Export Leaderboard"
                  data={exportData} 
                  filename={`Star_Tracker_Leaderboard_${new Date().toISOString().slice(0,10)}`}
                  title="KPRCAS Star Tracker - Student Leaderboard"
                  columns={[
                    { header: 'Rank', dataKey: 'Rank' },
                    { header: 'Roll Number', dataKey: 'Roll Number' },
                    { header: 'Student Name', dataKey: 'Student Name' },
                    { header: 'Class', dataKey: 'Class' },
                    { header: 'Star Points (SP)', dataKey: 'Star Points (SP)' },
                    { header: 'Internal Marks', dataKey: 'Internal Marks (2 SP = 1 Mark)' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Top 3 Podium Cards */}
          {!loading && leaderboard.length >= 3 && (
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

          {/* Full Standings Table */}
          <div className="glass-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                <p>Loading Leaderboard Standings...</p>
              </div>
            ) : filtered.length === 0 ? (
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
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => {
                      const isMe = user?.id === s.id;
                      return (
                        <tr 
                          key={s.id} 
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: isMe ? 'rgba(32,142,71,0.08)' : 'transparent',
                            fontWeight: isMe ? 700 : 'normal'
                          }}
                        >
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            {idx === 0 ? <span style={{ fontWeight: 800, color: '#D97706', fontSize: '1.1rem' }}>🥇 1</span> :
                             idx === 1 ? <span style={{ fontWeight: 800, color: '#64748B', fontSize: '1.1rem' }}>🥈 2</span> :
                             idx === 2 ? <span style={{ fontWeight: 800, color: '#B45309', fontSize: '1.1rem' }}>🥉 3</span> :
                             <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{idx + 1}</span>}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {s.name} {isMe && <span style={{ fontSize: '0.75rem', color: 'var(--brand-green)', fontWeight: 700 }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.reg_no_emp_id}</div>
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                            {s.class_name ? `${s.class_name} - ${s.class_section || ''}` : '—'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
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
                              background: 'rgba(32,142,71,0.12)',
                              color: 'var(--brand-green)',
                              border: '1px solid rgba(32,142,71,0.25)'
                            }}>
                              {s.internal_marks_100 || 0} / 100
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
