import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  GraduationCap, 
  Users, 
  Award, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Trophy, 
  FileText, 
  RefreshCw,
  Sparkles,
  ChevronRight,
  BookOpen
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
  Legend,
  LabelList 
} from 'recharts';

const COLORS = ['#208e47', '#2b4d91', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6366f1', '#14b8a6', '#f97316'];

export default function PrincipalDashboard() {
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
      const res = await api.getPrincipalDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load Principal dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {};
  const schools = data?.schools || data?.schools_overview || [];
  const verticals = data?.vertical_overview || data?.vertical_breakdown || [];
  const recentActivities = data?.recent_activities || [];

  // Chart data for School Star Points Comparison
  const schoolChartData = schools.map(s => ({
    name: s.code || s.school_code || s.name || s.school_name || 'School',
    fullName: s.name || s.school_name || s.code || 'School',
    points: Number(s.total_sp ?? s.sp ?? 0),
    avg: Number(s.avg_sp ?? 0),
    students: Number(s.students_count ?? s.total_students ?? 0),
    programmes: Number(s.programmes_count ?? s.total_programmes ?? 0)
  }));

  const totalSchoolPoints = schoolChartData.reduce((acc, curr) => acc + curr.points, 0);

  const verticalChartData = verticals.map(v => ({
    name: v.code || v.vertical_code || v.name,
    fullName: v.name || v.vertical_name || v.code,
    value: Number(v.total_sp ?? v.points ?? 0),
    count: v.submissions ?? v.count ?? 0,
    percentage: v.percentage || (v.total_sp && kpis.total_sp ? Math.round((v.total_sp / kpis.total_sp) * 100) : 0)
  })).filter(v => v.value > 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="principal" role="principal" />

        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1440, width: '100%' }}>
          
          {/* Executive Header */}
          <div style={{ 
            marginBottom: '1.75rem',
            background: 'linear-gradient(135deg, rgba(32, 142, 71, 0.08) 0%, rgba(43, 77, 145, 0.08) 100%)',
            border: '1px solid rgba(32, 142, 71, 0.2)',
            borderRadius: 16,
            padding: '1.5rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #208e47 0%, #2b4d91 100%)',
                  padding: '0.5rem',
                  borderRadius: 10,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Principal Executive Portal
                  </h1>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    KPR College of Arts, Science and Research • Institution-Wide Overview
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={fetchDashboard}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={15} className={loading ? 'spin-animation' : ''} />
                Refresh Data
              </button>

              <Link
                to="/principal/reports"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  background: 'linear-gradient(135deg, #208e47 0%, #2b4d91 100%)',
                  color: '#fff',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(32, 142, 71, 0.25)'
                }}
              >
                <FileText size={16} />
                Executive Reports
              </Link>
            </div>
          </div>

          {/* College Level KPIs */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.25rem', 
            marginBottom: '1.75rem' 
          }}>
            {/* Total Schools */}
            <div 
              onClick={() => navigate('/principal/schools')}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Schools
                </span>
                <div style={{ padding: '0.45rem', borderRadius: 8, background: 'rgba(32, 142, 71, 0.12)', color: '#208e47' }}>
                  <Building2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {loading ? '...' : (kpis.total_schools || 6)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#208e47', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                All academic schools <ChevronRight size={14} />
              </div>
            </div>

            {/* Total Programmes */}
            <div 
              onClick={() => navigate('/principal/programmes')}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Programmes / Depts
                </span>
                <div style={{ padding: '0.45rem', borderRadius: 8, background: 'rgba(43, 77, 145, 0.12)', color: '#2b4d91' }}>
                  <Layers size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {loading ? '...' : (kpis.total_programmes || 22)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#2b4d91', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Departments with HODs <ChevronRight size={14} />
              </div>
            </div>

            {/* Total Students */}
            <div 
              onClick={() => navigate('/principal/students')}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Students
                </span>
                <div style={{ padding: '0.45rem', borderRadius: 8, background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {loading ? '...' : (kpis.total_students || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Across all years & sections
              </div>
            </div>

            {/* College Star Points */}
            <div 
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  College Star Points
                </span>
                <div style={{ padding: '0.45rem', borderRadius: 8, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                  <Trophy size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#208e47', marginBottom: '0.25rem' }}>
                {loading ? '...' : (kpis.total_sp || 0).toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>SP</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {kpis.total_students > 0 ? `${(kpis.total_sp / kpis.total_students).toFixed(1)} avg SP / student` : 'Cumulative Points'}
              </div>
            </div>

            {/* Approved Achievements */}
            <div 
              onClick={() => navigate('/principal/achievements')}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Achievements
                </span>
                <div style={{ padding: '0.45rem', borderRadius: 8, background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                  <Award size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {loading ? '...' : (kpis.total_achievements || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Verified records <ChevronRight size={14} />
              </div>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
            
            {/* School Star Points Bar Chart */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    School Performance Comparison
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Total Star Points earned across all 6 Academic Schools
                  </p>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#208e47', background: 'rgba(32, 142, 71, 0.1)', padding: '0.25rem 0.6rem', borderRadius: 6 }}>
                  SP Comparison
                </span>
              </div>

              {schoolChartData.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No school performance data available
                </div>
              ) : (
                <div>
                  <div style={{ height: 280, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={schoolChartData} margin={{ top: 25, right: 20, left: -10, bottom: 25 }}>
                        <XAxis 
                          dataKey="name" 
                          stroke="var(--text-primary)" 
                          fontSize={12} 
                          fontWeight={700}
                          tickLine={true}
                          interval={0}
                        />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'var(--bg-secondary)', 
                            borderColor: 'var(--border-color)',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                          }}
                          formatter={(val, name, item) => [`${val} Star Points (${totalSchoolPoints > 0 ? ((val / totalSchoolPoints) * 100).toFixed(1) : 0}%)`, item.payload.fullName]}
                        />
                        <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                          <LabelList 
                            dataKey="points" 
                            position="top" 
                            fill="var(--text-primary)" 
                            fontSize={11} 
                            fontWeight={800} 
                            formatter={(val) => `${val} SP`} 
                          />
                          {schoolChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* School Points Difference Summary Badges */}
                  <div style={{
                    marginTop: '0.85rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.5rem'
                  }}>
                    {schoolChartData.map((s, idx) => {
                      const share = totalSchoolPoints > 0 ? ((s.points / totalSchoolPoints) * 100).toFixed(0) : 0;
                      return (
                        <div 
                          key={s.name}
                          style={{
                            background: 'var(--bg-primary)',
                            borderRadius: 8,
                            padding: '0.45rem 0.6rem',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.15rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                            <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{s.name}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                            <span style={{ color: '#208e47', fontWeight: 700 }}>{s.points} SP</span>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{share}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Distribution Pie Chart */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    College-Wide Vertical Distribution
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Points distribution across all development verticals
                  </p>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2b4d91', background: 'rgba(43, 77, 145, 0.1)', padding: '0.25rem 0.6rem', borderRadius: 6 }}>
                  Vertical Matrix
                </span>
              </div>

              {verticalChartData.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  No vertical distribution data available
                </div>
              ) : (
                <div style={{ height: 280, width: '100%', display: 'flex', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verticalChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {verticalChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--bg-secondary)', 
                          borderColor: 'var(--border-color)',
                          borderRadius: 8
                        }}
                        formatter={(val, name, item) => [`${val} Points (${item.payload.percentage}%)`, item.payload.fullName]}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Schools Overview Table */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Academic Schools Performance Overview
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Visibility across all 6 Deans and their corresponding Academic Schools
                </p>
              </div>

              <Link
                to="/principal/schools"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#208e47',
                  textDecoration: 'none'
                }}
              >
                View Full Schools Directory <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>School</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dean</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Programmes</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Students</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Total Star Points</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Avg SP / Student</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {loading ? 'Loading schools data...' : 'No schools found.'}
                      </td>
                    </tr>
                  ) : (
                    schools.map((school, index) => (
                      <tr 
                        key={school.school_id || index}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {school.school_name}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#208e47', fontWeight: 600 }}>
                            {school.school_code}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ShieldCheck size={16} color="#2b4d91" />
                            {school.dean_name}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span style={{ background: 'rgba(43, 77, 145, 0.08)', padding: '0.2rem 0.6rem', borderRadius: 6, color: '#2b4d91' }}>
                            {school.total_programmes} Depts
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {(school.total_students || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#208e47', fontSize: '1rem' }}>
                          {(school.total_sp || 0).toLocaleString()} <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>SP</span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {school.avg_sp || 0}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => navigate(`/principal/programmes?school_id=${school.school_id}`)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: 'transparent',
                              border: '1px solid var(--border-color)',
                              borderRadius: 6,
                              color: '#2b4d91',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Explore
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent College Activity Feed */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Recent Verified Achievements
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Real-time achievements logged across all college schools
                </p>
              </div>

              <Link
                to="/principal/achievements"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#208e47',
                  textDecoration: 'none'
                }}
              >
                View All Achievements <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {recentActivities.length === 0 ? (
                <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1' }}>
                  No recent activities found.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 12,
                      padding: '1rem 1.15rem',
                      background: 'var(--bg-primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {act.student_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {act.register_number} • {act.programme || act.school}
                        </div>
                      </div>
                      <span style={{
                        background: 'rgba(32, 142, 71, 0.12)',
                        color: '#208e47',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 6
                      }}>
                        +{act.points} SP
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                      {act.category_name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>{act.school}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#208e47', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
