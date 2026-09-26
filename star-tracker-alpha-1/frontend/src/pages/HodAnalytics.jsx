import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Layers, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  Activity, 
  FileCheck, 
  Percent,
  ChevronRight
} from 'lucide-react';

export default function HodAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [verticals, setVerticals] = useState([]);
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [hodStats, vertsRes, clsRes, subsRes] = await Promise.all([
        api.getHodStats().catch(() => ({})),
        api.getVerticals().catch(() => ({ verticals: [] })),
        api.getClasses().catch(() => []),
        api.getDetailedSubmissions().catch(() => ({ submissions: [] }))
      ]);

      setStats(hodStats || {});
      const vertsList = Array.isArray(vertsRes) ? vertsRes : (vertsRes?.verticals || []);
      setVerticals(vertsList);
      setClasses(Array.isArray(clsRes) ? clsRes : (clsRes?.classes || []));
      setSubmissions(subsRes?.submissions || (Array.isArray(subsRes) ? subsRes : []));
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute per-vertical points and stats
  const verticalStatsMap = useMemo(() => {
    const map = {};
    verticals.forEach(v => {
      const vSubs = submissions.filter(s => s.vertical_id === v.id || s.vertical_code === v.code);
      const approved = vSubs.filter(s => s.status === 'approved');
      const totalSP = approved.reduce((acc, s) => acc + Number(s.claimed_sp || 0), 0);
      const studentIds = new Set(approved.map(s => s.student_id));
      
      map[v.id] = {
        totalSP,
        submissionsCount: vSubs.length,
        approvedCount: approved.length,
        studentCount: studentIds.size,
      };
    });
    return map;
  }, [verticals, submissions]);

  // Total department star points across all approved submissions
  const deptTotalSP = useMemo(() => {
    const fromStats = Number(stats?.total_points || stats?.total_sp || 0);
    if (fromStats > 0) return fromStats;
    const computed = Object.values(verticalStatsMap).reduce((acc, curr) => acc + curr.totalSP, 0);
    return computed > 0 ? computed : 1;
  }, [stats, verticalStatsMap]);

  const exportData = [
    { Metric: 'Total Enrolled Students', Value: stats?.total_students || 0 },
    { Metric: 'Total Star Points Generated', Value: stats?.total_points || stats?.total_sp || 0 },
    { Metric: 'Total Internal Marks Awarded', Value: stats?.total_marks || 0 },
    { Metric: 'Total Approved Submissions', Value: stats?.total_approved || 0 },
    { Metric: 'Pending Review Queue', Value: stats?.pending_reviews || 0 },
    ...verticals.map(v => {
      const vSP = verticalStatsMap[v.id]?.totalSP || 0;
      const vPct = deptTotalSP > 0 ? ((vSP / deptTotalSP) * 100).toFixed(1) : '0';
      return {
        Metric: `${v.code} — ${v.name} (${v.type})`,
        Value: `${vSP} SP (${vPct}% of Dept Total)`
      };
    })
  ];

  const userRole = user?.role || 'hod';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      
      <div style={{ display: 'flex' }}>
        <Sidebar userRole={userRole} role={userRole} />
        
        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1400, width: '100%' }}>
          
          {/* Sticky Header Banner */}
          <div style={{ 
            position: 'sticky', 
            top: 72, 
            zIndex: 35, 
            marginBottom: '1.5rem',
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            padding: '1.25rem 1.5rem',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '1rem' 
          }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--brand-blue)' }}>
                Department Performance & Metrics
              </h1>
            </div>

            <div className="header-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={fetchAnalytics}
                className="btn btn-secondary"
                title="Refresh Analytics"
                style={{ height: 38, padding: '0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <ExportButton 
                buttonText="Export Metrics"
                data={exportData} 
                filename="Department_Analytics_Summary" 
                title="Department Performance & Metrics Summary"
                columns={[
                  { header: 'Metric', dataKey: 'Metric' },
                  { header: 'Value', dataKey: 'Value' }
                ]}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--brand-green)' }} />
              <p style={{ fontSize: '0.9rem' }}>Loading Department Analytics...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Summary Metrics KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Total Students</p>
                      <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.3rem 0 0 0', color: 'var(--brand-blue)' }}>{stats?.total_students || 0}</h2>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Enrolled Across All Sections</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(43,77,145,0.12)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={22} />
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Star Points Awarded</p>
                      <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.3rem 0 0 0', color: 'var(--brand-green)' }}>{stats?.total_points || stats?.total_sp || 0} SP</h2>
                      <div style={{ fontSize: '0.7rem', color: 'var(--brand-green)', fontWeight: 600, marginTop: 2 }}>Overall Department Points</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={22} />
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Converted Marks</p>
                      <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.3rem 0 0 0', color: '#1E3870' }}>{stats?.total_marks || ((stats?.total_points || 0) / 2).toFixed(1)} Marks</h2>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Formula: 2 SP = 1 Mark</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(43,77,145,0.12)', color: '#1E3870', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={22} />
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Approved Submissions</p>
                      <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.3rem 0 0 0', color: '#D97706' }}>{stats?.total_approved || 0}</h2>
                      <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 600, marginTop: 2 }}>{stats?.pending_reviews || 0} in review queue</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(217,119,6,0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={22} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* 10-VERTICAL CURRICULUM FRAMEWORK CARDS WITH PROGRESS BARS    */}
              {/* ============================================================= */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                      10-Vertical Curriculum Framework & Points Progress
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(32,142,71,0.08)', padding: '0.35rem 0.75rem', borderRadius: 8, border: '1px solid rgba(32,142,71,0.2)' }}>
                    <Layers size={16} color="var(--brand-green)" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-green)' }}>
                      Total Dept Points: {deptTotalSP} SP
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {verticals.map((v) => {
                    const vStats = verticalStatsMap[v.id] || { totalSP: 0, submissionsCount: 0, approvedCount: 0, studentCount: 0 };
                    const vPoints = vStats.totalSP;
                    const vPct = deptTotalSP > 0 ? ((vPoints / deptTotalSP) * 100).toFixed(1) : '0';
                    const numPct = Math.min(100, Math.max(0, Number(vPct)));
                    const convertedMarks = (vPoints / 2.0).toFixed(1);

                    return (
                      <div 
                        key={v.id} 
                        style={{
                          padding: '1.2rem',
                          borderRadius: 12,
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ marginBottom: '1rem' }}>
                          {/* Vertical Code Badge & Type */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                            <span style={{ 
                              fontSize: '0.78rem', 
                              fontWeight: 800, 
                              padding: '3px 9px', 
                              borderRadius: 6, 
                              background: 'rgba(43,77,145,0.12)', 
                              color: 'var(--brand-blue)',
                              border: '1px solid rgba(43,77,145,0.2)'
                            }}>
                              {v.code}
                            </span>
                            <span className={`badge badge-${v.type === 'Mandatory' ? 'mandatory' : 'optional'}`} style={{ fontSize: '0.7rem' }}>
                              {v.type} (Max {v.max_sp} SP)
                            </span>
                          </div>

                          {/* Vertical Name */}
                          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                            {v.name}
                          </h4>
                        </div>

                        {/* Progress Bar & Department Points Section */}
                        <div style={{
                          background: 'var(--bg-secondary)',
                          padding: '0.85rem 1rem',
                          borderRadius: 10,
                          border: '1px solid var(--border-color)',
                          marginTop: 'auto'
                        }}>
                          {/* Progress Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', fontSize: '0.75rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                              Department Point Share
                            </span>
                            <span style={{ fontWeight: 800, color: 'var(--brand-green)' }}>
                              {vPoints} SP <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>({vPct}%)</span>
                            </span>
                          </div>

                          {/* Progress Bar Track */}
                          <div style={{
                            width: '100%',
                            height: 8,
                            borderRadius: 999,
                            background: 'var(--border-color)',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            {/* Progress Bar Fill */}
                            <div style={{
                              width: `${numPct}%`,
                              height: '100%',
                              borderRadius: 999,
                              background: numPct > 0 ? 'var(--brand-green)' : 'transparent',
                              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: numPct > 0 ? '0 0 8px rgba(32,142,71,0.35)' : 'none'
                            }} />
                          </div>

                          {/* Progress Footer Meta */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginTop: '0.55rem', 
                            fontSize: '0.7rem', 
                            color: 'var(--text-muted)' 
                          }}>
                            <span>
                              <strong style={{ color: 'var(--text-primary)' }}>{vStats.approvedCount}</strong> approved
                            </span>
                            <span>
                              <strong style={{ color: '#1E3870' }}>{convertedMarks}</strong> marks
                            </span>
                            <span>
                              <strong style={{ color: 'var(--brand-blue)' }}>{vStats.studentCount}</strong> students
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
