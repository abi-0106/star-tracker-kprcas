import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Building, 
  Users, 
  Award, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  Trophy, 
  FileText, 
  Activity,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

const COLORS = ['#208e47', '#2b4d91', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6366f1', '#14b8a6', '#f97316'];

export default function DeanDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDeanDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load Dean dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {};
  const depts = data?.department_performance || [];
  const verticals = data?.vertical_performance || [];
  const topStudents = data?.top_students || [];

  // Chart data
  const deptChartData = depts.map(d => ({
    name: d.code || d.name,
    fullName: d.name,
    points: d.total_sp,
    avg: d.avg_sp,
    students: d.total_students
  }));

  const verticalChartData = verticals.map(v => ({
    name: v.code,
    fullName: v.name,
    value: v.total_sp,
    participants: v.student_participants
  })).filter(v => v.value > 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="dean" role="dean" />

        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1440, width: '100%' }}>
          
          {/* Executive Header */}
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
            gap: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge" style={{ background: 'rgba(43,77,145,0.12)', color: 'var(--brand-blue)', fontWeight: 800 }}>
                  {data?.school ? `${data.school.name.toUpperCase()} (${data.school.code})` : 'SCHOOL ACADEMIC OVERSIGHT'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  • School Level Scope
                </span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                School Academic Performance & Star Points Overview
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Centralized monitoring across all programmes, verticals, and student achievements under {data?.school?.name || 'your assigned School'}.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={fetchDashboard}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                title="Refresh Metrics"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <Link to="/dean/reports" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                <FileText size={14} />
                <span>Executive Reports</span>
              </Link>
            </div>
          </div>

          {/* 8 Executive KPI Cards Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem', 
            marginBottom: '1.75rem' 
          }}>
            {/* KPI 1: Total Students */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid var(--brand-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Students</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(43,77,145,0.1)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : kpis.total_students || 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrolled Institution-Wide</span>
            </div>

            {/* KPI 2: Total Departments */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid #8b5cf6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Departments</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : kpis.total_departments || 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Academic Streams</span>
            </div>

            {/* KPI 3: Total Star Points */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid var(--brand-green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Star Points</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(32,142,71,0.1)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-green)', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : `${kpis.total_star_points || 0} SP`}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {kpis.total_bonus_points ? `+${kpis.total_bonus_points} Bonus SP` : 'Accumulated Points'}
              </span>
            </div>

            {/* KPI 4: Converted Internal Marks */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid #0ea5e9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Internal Marks</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0ea5e9', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : Math.round((kpis.total_star_points || 0) / 2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rule: 2 SP = 1 Mark</span>
            </div>

            {/* KPI 5: Approved Achievements */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved Proofs</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : kpis.total_approved || 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified by Faculty</span>
            </div>

            {/* KPI 6: Pending Approvals */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Queue</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : kpis.total_pending || 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting Verification</span>
            </div>

            {/* KPI 7: Active Participation Rate */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Participation</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366f1', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : `${kpis.participation_rate || 0}%`}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {kpis.active_students || 0} active students
              </span>
            </div>

            {/* KPI 8: Average SP / Student */}
            <div className="glass-card" style={{ padding: '1.1rem', borderTop: '3px solid #ec4899' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Points</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(236,72,153,0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ec4899', margin: '0.4rem 0 0.1rem' }}>
                {loading ? '—' : `${kpis.avg_sp_per_student || 0} SP`}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per Student Benchmark</span>
            </div>
          </div>

          {/* Analytical Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
            
            {/* Chart 1: Department Star Points Benchmark */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Department Star Points Comparison
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Total Star Points earned per department
                  </p>
                </div>
                <Link to="/dean/departments" style={{ fontSize: '0.78rem', color: 'var(--brand-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span>View All</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {deptChartData.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No department points recorded yet
                </div>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        formatter={(val, name, item) => [`${val} SP (Avg: ${item.payload.avg} SP)`, item.payload.fullName]}
                        contentStyle={{ borderRadius: 8, fontSize: '0.8rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                      />
                      <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                        {deptChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Vertical Share Donut */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Vertical Points Distribution
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Share of Star Points across the 10 curriculum verticals
                  </p>
                </div>
                <Link to="/dean/verticals" style={{ fontSize: '0.78rem', color: 'var(--brand-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span>Explore</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {verticalChartData.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No vertical points recorded yet
                </div>
              ) : (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verticalChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {verticalChartData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val, name, item) => [`${val} SP (${item.payload.participants} students)`, item.payload.fullName]}
                        contentStyle={{ borderRadius: 8, fontSize: '0.8rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Department Performance Overview Table */}
          <div className="glass-card" style={{ marginBottom: '1.75rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Academic Department Performance Benchmark
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Comparative overview of student enrollment, points awarded, and approval throughput.
                </p>
              </div>
              <Link to="/dean/departments" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                Detailed Department Drilldown →
              </Link>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Students</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total Points</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Avg Points / Student</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Participation</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Approved</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Pending</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {depts.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No departmental records found.
                      </td>
                    </tr>
                  ) : (
                    depts.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Code: {d.code}</div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
                          {d.total_students}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                          {d.total_sp} SP
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--brand-blue)' }}>
                          {d.avg_sp} SP
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                            <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, d.participation_rate)}%`, height: '100%', background: 'var(--brand-green)' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.participation_rate}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>
                          {d.approved_count}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: d.pending_count > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 700 }}>
                          {d.pending_count}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => navigate(`/dean/departments?id=${d.id}`)}
                            className="btn btn-secondary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 10 High Performers Across Institution */}
          <div className="glass-card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Top 10 High Achievers (Institution-Wide)
                </h3>
              </div>
              <Link to="/dean/leaderboard" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
                Full Institutional Leaderboard →
              </Link>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'center', width: 60 }}>Rank</th>
                    <th style={{ padding: '0.75rem' }}>Student</th>
                    <th style={{ padding: '0.75rem' }}>Department & Class</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Star Points</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Internal Marks</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No student achievements recorded.
                      </td>
                    </tr>
                  ) : (
                    topStudents.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800 }}>
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.reg_no_emp_id}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{s.department_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.class_name ? `${s.class_name} - Sec ${s.class_section || ''}` : `Year ${s.year || 1}`}</div>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                          +{s.total_sp} SP
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'rgba(32,142,71,0.12)',
                            color: 'var(--brand-green)'
                          }}>
                            {s.internal_marks_100} / 100
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {s.mandatory_satisfied ? (
                            <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>Satisfied</span>
                          ) : (
                            <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>In Progress</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
