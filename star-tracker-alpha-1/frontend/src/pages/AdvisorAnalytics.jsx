import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Trophy, Award, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { api } from '../services/api';

export default function AdvisorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    api.getAdvisorDashboard()
      .then(resData => {
        setData(resData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Class Analytics...</p>
      </div>
    );
  }

  const { classInfo, stats, students } = data;
  const satisfiedCount = students.filter(s => s.mandatory_satisfied).length;
  const passRate = students.length > 0 ? Math.round((satisfiedCount / students.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="advisor" />

        <main style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)' }}>
            <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>CLASS PERFORMANCE ANALYTICS</span>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>
              Analytics: {classInfo?.name} — Sec {classInfo?.section}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Performance statistics and mandatory vertical compliance metrics.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-card">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Section Compliance Rate</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--brand-green)' }}>{passRate}%</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{satisfiedCount} of {students.length} students satisfied mandatory thresholds</p>
            </div>

            <div className="glass-card">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mean Star Points</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--brand-blue)' }}>{stats.avgSP} SP</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Class average star points score</p>
            </div>

            <div className="glass-card">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Approved Proofs</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--brand-green)' }}>{stats.totalApproved}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified achievements across all verticals</p>
            </div>

            <div className="glass-card">
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Students</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0', color: '#D97706' }}>{students.length}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enrolled in {classInfo?.name}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
