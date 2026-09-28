import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Layers, 
  Award, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Building, 
  Users, 
  Sparkles, 
  RefreshCw,
  Info,
  ChevronRight
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

export default function DeanVerticals() {
  const [verticals, setVerticals] = useState([]);
  const [selectedVerticalId, setSelectedVerticalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchVerticals();
  }, []);

  const fetchVerticals = async () => {
    try {
      setLoading(true);
      const res = await api.getDeanVerticals();
      const list = res.verticals || [];
      setVerticals(list);
      if (!selectedVerticalId && list.length > 0) {
        setSelectedVerticalId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load verticals:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedVertical = verticals.find(v => v.id === selectedVerticalId) || verticals[0];

  const deptDistChartData = (selectedVertical?.department_distribution || []).map(d => ({
    name: d.department_code || d.department_name,
    fullName: d.department_name,
    sp: d.sp_awarded,
    submissions: d.submissions,
    participants: d.participants
  }));

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
                <span className="badge" style={{ background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', fontWeight: 800 }}>
                  CURRICULUM VERTICAL ANALYSIS
                </span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                10-Vertical Curriculum Performance & Sub-Vertical Drilldown
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Analyze student engagement, approved points, bonus activities, and departmental distribution across verticals.
              </p>
            </div>

            <button
              onClick={fetchVerticals}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--brand-green)' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>Loading Curriculum Verticals...</h3>
              <p style={{ fontSize: '0.82rem', margin: 0 }}>Fetching school vertical performance and activities</p>
            </div>
          ) : verticals.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <Layers size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>No Verticals Found</h3>
              <p style={{ fontSize: '0.82rem' }}>No curriculum verticals are currently configured for this school.</p>
            </div>
          ) : (
            <>
              {/* 10 Vertical Selector Tabs */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                {verticals.map((v, idx) => {
                  const isSelected = selectedVertical?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVerticalId(v.id)}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: 8,
                        border: isSelected ? '2px solid var(--brand-green)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(32,142,71,0.08)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--brand-green)' : 'var(--text-primary)',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ 
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: COLORS[idx % COLORS.length]
                      }} />
                      <span>{v.code}: {v.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Vertical Detail Section */}
              {selectedVertical && (
                <div>
              {/* Summary Card */}
              <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--brand-green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-green)', textTransform: 'uppercase' }}>
                      VERTICAL CODE: {selectedVertical.code}
                    </span>
                    <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedVertical.name}
                    </h2>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 700 }}>
                      {selectedVertical.description || 'Comprehensive curriculum activity tracking and star points evaluation.'}
                    </p>
                  </div>

                  {/* Quick Metrics */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(32,142,71,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-green)' }}>TOTAL STAR POINTS</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-green)' }}>{selectedVertical.total_sp} SP</div>
                    </div>
                    <div style={{ background: 'rgba(43,77,145,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-blue)' }}>PARTICIPANTS</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{selectedVertical.student_participants} Students</div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>APPROVED</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{selectedVertical.approved_submissions}</div>
                    </div>
                    <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.5rem 0.85rem', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b' }}>PENDING</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>{selectedVertical.pending_submissions}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Verticals (Activities) Table */}
              <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Sub-Verticals & Approved Activities
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedVertical.activities?.length || 0} Listed Activities
                  </span>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 1rem', width: '35%' }}>Activity / Sub-Vertical</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '15%' }}>Bonus Eligible</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '15%' }}>Submissions</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '15%' }}>Approved</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', width: '20%' }}>Star Points Awarded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!selectedVertical.activities || selectedVertical.activities.length === 0) ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No sub-vertical activities configured.
                          </td>
                        </tr>
                      ) : (
                        selectedVertical.activities.map((act) => (
                          <tr key={act.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{act.name}</div>
                              {act.description && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{act.description}</div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              {act.is_bonus_eligible ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  background: 'rgba(245,158,11,0.12)',
                                  color: '#d97706',
                                  border: '1px solid rgba(245,158,11,0.25)'
                                }}>
                                  <Sparkles size={10} /> Bonus Eligible
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard</span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
                              {act.total_submissions}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700, color: '#10b981' }}>
                              {act.approved_count}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                              +{act.total_sp} SP
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department Distribution Chart */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Departmental Distribution in {selectedVertical.name}
                </h3>

                {deptDistChartData.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No department data available.</p>
                ) : (
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptDistChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          formatter={(val, name, item) => [`${val} SP (${item.payload.participants} students)`, item.payload.fullName]}
                          contentStyle={{ borderRadius: 8, fontSize: '0.8rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                        />
                        <Bar dataKey="sp" fill="var(--brand-green)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
          </>
        )}

        </main>
      </div>
    </div>
  );
}
