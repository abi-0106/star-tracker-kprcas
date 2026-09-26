import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw,
  BarChart3,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function AdvisorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const fetchAnalytics = () => {
    setLoading(true);
    api.getAdvisorDashboard()
      .then(resData => {
        setData(resData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const students = data?.students || [];
  const classInfo = data?.classInfo;
  const stats = data?.stats || { totalStudents: 0, totalPending: 0, totalApproved: 0, avgSP: 0 };

  const satisfiedCount = useMemo(() => students.filter(s => s.mandatory_satisfied).length, [students]);
  const passRate = useMemo(() => students.length > 0 ? Math.round((satisfiedCount / students.length) * 100) : 0, [satisfiedCount, students.length]);
  const totalClassSP = useMemo(() => students.reduce((acc, s) => acc + Number(s.total_sp || 0), 0), [students]);
  const totalClassMarks = useMemo(() => (totalClassSP / 2.0).toFixed(1), [totalClassSP]);

  const exportData = [
    { Metric: 'Class Name', Value: `${classInfo?.name || 'Class'} - Sec ${classInfo?.section || 'A'}` },
    { Metric: 'Total Enrolled Students', Value: students.length },
    { Metric: 'Section Compliance Rate', Value: `${passRate}% (${satisfiedCount}/${students.length})` },
    { Metric: 'Mean Star Points', Value: `${stats.avgSP} SP` },
    { Metric: 'Mean Internal Mark', Value: `${(stats.avgSP / 2).toFixed(1)} / 100` },
    { Metric: 'Total Approved Proofs', Value: stats.totalApproved },
    { Metric: 'Pending Review Queue', Value: stats.totalPending },
    { Metric: 'Cumulative Star Points', Value: `${totalClassSP} SP` },
    { Metric: 'Cumulative Internal Marks', Value: `${totalClassMarks} Marks` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="advisor" />

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-mandatory">CLASS PERFORMANCE ANALYTICS</span>
                <span className="badge badge-approved">{classInfo ? `${classInfo.name} — Sec ${classInfo.section}` : 'Section Analytics'}</span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--brand-blue)' }}>
                Analytics & Section KPIs: {classInfo?.name} — Sec {classInfo?.section}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                Section performance statistics, mandatory vertical compliance, and internal marks distribution.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                buttonText="Export Section Analytics"
                data={exportData} 
                filename={`Section_Analytics_${classInfo?.name || 'Class'}`} 
                title="Section Performance & KPI Summary"
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
              <p style={{ fontSize: '0.9rem' }}>Loading Section Analytics...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Standard 4 Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.15rem' }}>
                
                {/* 1. Total Students */}
                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Students</span>
                    <Users size={19} color="var(--brand-blue)" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1.1 }}>
                    {students.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Enrolled in {classInfo?.name}
                  </div>
                </div>

                {/* 2. Mean Star Points */}
                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Class Average SP</span>
                    <Award size={19} color="var(--brand-blue)" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1.1 }}>
                    {stats.avgSP} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SP</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Mean Internal: {(stats.avgSP / 2).toFixed(1)} / 100 Marks
                  </div>
                </div>

                {/* 3. Total Approved Proofs */}
                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Approved Proofs</span>
                    <CheckCircle2 size={19} color="var(--brand-green)" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-green)', lineHeight: 1.1 }}>
                    {stats.totalApproved}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Verified achievements in section
                  </div>
                </div>

                {/* 4. Pending Review Queue */}
                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Review Queue Backlog</span>
                    <Clock size={19} color="#D97706" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
                    {stats.totalPending}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Submissions awaiting verification
                  </div>
                </div>

              </div>

              {/* Top Performing Students Table Preview */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                      Section Leaderboard & Top Performers
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      Highest star points achievers in {classInfo?.name || 'Class Section'}
                    </p>
                  </div>
                  <Trophy size={20} color="#D97706" />
                </div>

                <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.65rem 0.5rem', width: '8%', textAlign: 'center' }}>Rank</th>
                        <th style={{ padding: '0.65rem 0.75rem', width: '20%' }}>Register No</th>
                        <th style={{ padding: '0.65rem 0.75rem', width: '32%' }}>Student Name</th>
                        <th style={{ padding: '0.65rem 0.75rem', width: '15%', textAlign: 'center' }}>Star Points</th>
                        <th style={{ padding: '0.65rem 0.75rem', width: '15%', textAlign: 'center' }}>Internal Mark</th>
                        <th style={{ padding: '0.65rem 0.75rem', width: '10%', textAlign: 'center' }}>Mandatory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 5).map((s, idx) => (
                        <tr key={s.id || idx} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }}>
                          <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontWeight: 800, color: idx === 0 ? '#D97706' : 'var(--text-muted)' }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                            {s.reg_no_emp_id}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {s.name}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                            {s.total_sp} SP
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                            {s.internal_marks_100} / 100
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                            {s.mandatory_satisfied ? (
                              <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>Satisfied</span>
                            ) : (
                              <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>Needs SP</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
