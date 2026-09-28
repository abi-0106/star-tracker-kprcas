import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const PIE_COLORS = [
  '#208E47', // Brand Green
  '#2B4D91', // Brand Blue
  '#0284C7', // Sky Blue
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Orange
  '#6366F1', // Indigo
  '#14B8A6'  // Teal
];

// Custom Tooltip Component for Charts
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 8,
        padding: '0.65rem 0.85rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        fontSize: '0.78rem'
      }}>
        <p style={{ fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
          {label || payload[0].name}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '0.2rem 0', color: entry.color || entry.fill, fontWeight: 600 }}>
            {entry.name}: <strong>{entry.value} {entry.unit || ''}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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

  // 1. Data for Vertical Points Bar Chart
  const verticalBarData = useMemo(() => {
    return verticals.map(v => {
      const vStats = verticalStatsMap[v.id] || { totalSP: 0, studentCount: 0, approvedCount: 0 };
      return {
        code: v.code,
        name: `${v.code} - ${v.name}`,
        shortName: v.code,
        points: vStats.totalSP,
        marks: Number((vStats.totalSP / 2).toFixed(1)),
        students: vStats.studentCount,
        approved: vStats.approvedCount
      };
    });
  }, [verticals, verticalStatsMap]);

  // 2. Data for Vertical Points Share Pie/Donut Chart
  const verticalPieData = useMemo(() => {
    const active = verticals
      .map(v => {
        const vStats = verticalStatsMap[v.id] || { totalSP: 0 };
        return {
          name: `${v.code} - ${v.name}`,
          code: v.code,
          value: vStats.totalSP,
          type: v.type
        };
      })
      .filter(item => item.value > 0);

    if (active.length === 0) {
      return verticals.slice(0, 5).map(v => ({
        name: `${v.code} - ${v.name}`,
        code: v.code,
        value: 1,
        type: v.type
      }));
    }
    return active;
  }, [verticals, verticalStatsMap]);

  // 3. Data for Class Section Comparison Bar Chart
  const classBarData = useMemo(() => {
    return classes.map(cls => ({
      name: `${cls.name} (${cls.section || 'Sec'})`,
      avgSP: Number(cls.avg_sp || 0),
      students: Number(cls.student_count || 0),
      pending: Number(cls.pending_count || 0)
    }));
  }, [classes]);

  // 4. Data for Submissions Verification Status Pie Chart
  const submissionStatusData = useMemo(() => {
    const approved = stats?.total_approved || submissions.filter(s => s.status === 'approved').length;
    const pending = stats?.pending_reviews || submissions.filter(s => s.status === 'pending').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;

    const dataArr = [
      { name: 'Approved', value: approved, color: '#208E47' },
      { name: 'Pending Review', value: pending, color: '#D97706' },
      { name: 'Returned / Rejected', value: rejected, color: '#DC2626' }
    ].filter(d => d.value > 0);

    return dataArr.length > 0 ? dataArr : [{ name: 'Approved', value: 1, color: '#208E47' }];
  }, [stats, submissions]);

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
              {/* INTERACTIVE GRAPH KPI CARDS (BAR & PIE CHARTS)                */}
              {/* ============================================================= */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
                
                {/* 1. Bar Chart: Vertical-Wise Star Points Distribution */}
                <div className="glass-card" style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                          Vertical Star Points Distribution
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                          Points (SP) awarded across V1–V10
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>10 Verticals</span>
                  </div>

                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={verticalBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                        <XAxis 
                          dataKey="shortName" 
                          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                          interval={0}
                        />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                        <Bar 
                          dataKey="points" 
                          name="Star Points (SP)" 
                          fill="var(--brand-green)" 
                          radius={[6, 6, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Pie Chart: Vertical Points Share Breakdown */}
                <div className="glass-card" style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(43,77,145,0.12)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PieChartIcon size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                          Curriculum Points Share
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                          Proportional department point distribution
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-optional" style={{ fontSize: '0.68rem' }}>% Share</span>
                  </div>

                  <div style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<ChartTooltip />} />
                        <Pie
                          data={verticalPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          label={({ code, percent }) => `${code} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {verticalPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          wrapperStyle={{ fontSize: 11, maxHeight: 45, overflowY: 'auto' }}
                          formatter={(value) => value.length > 20 ? `${value.slice(0, 20)}...` : value}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Bar Chart: Class Sections Average Performance */}
                {classBarData.length > 0 && (
                  <div className="glass-card" style={{ padding: '1.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(217,119,6,0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                            Class Sections Average Performance
                          </h3>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                            Average Star Points & Student Enrolment
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-mandatory" style={{ fontSize: '0.68rem' }}>Sections</span>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                          />
                          <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                          <Bar 
                            dataKey="avgSP" 
                            name="Class Average (SP)" 
                            fill="var(--brand-green)" 
                            radius={[6, 6, 0, 0]} 
                          />
                          <Bar 
                            dataKey="students" 
                            name="Students Enrolled" 
                            fill="#0284C7" 
                            radius={[6, 6, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 4. Pie Chart: Verification Queue & Submission Status */}
                <div className="glass-card" style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                          Submissions Verification Status
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                          Approved vs Pending review backlog
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>Status</span>
                  </div>

                  <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<ChartTooltip />} />
                        <Pie
                          data={submissionStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {submissionStatusData.map((entry, index) => (
                            <Cell key={`status-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
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
