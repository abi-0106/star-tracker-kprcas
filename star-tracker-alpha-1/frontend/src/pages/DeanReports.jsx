import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { 
  FileText, 
  Building, 
  Layers, 
  Users, 
  Download, 
  RefreshCw,
  Award,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
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
  Legend,
  LabelList
} from 'recharts';

const COLORS = ['#208e47', '#2b4d91', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6366f1', '#14b8a6', '#f97316'];

export default function DeanReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'institution_summary';

  const [reportType, setReportType] = useState(initialType);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const fetchReport = async (type) => {
    try {
      setLoading(true);
      const res = await api.getDeanReports({ type });
      setReportData(res);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const rows = reportData?.data || [];
  const reportTitle = reportData?.title || 'Academic Performance Report';

  // Format columns for table and export
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const exportColumns = columns.map(col => ({
    header: col,
    dataKey: col
  }));

  const reportTabs = [
    { id: 'institution_summary', label: 'School Executive Summary', icon: FileText, desc: 'Overall school metrics & points breakdown' },
    { id: 'department_comparison', label: 'Department Comparison', icon: Building, desc: 'Interactive comparative analysis of SP and approvals' },
    { id: 'vertical_matrix', label: 'Vertical & Sub-Vertical Matrix', icon: Layers, desc: 'Performance across the 10 curriculum verticals' },
    { id: 'student_roster', label: 'Student Performance Roster', icon: Users, desc: 'Full student standings with converted internal marks' }
  ];

  // Visual Analytics Data for Department Comparison
  const deptBarData = rows.map(r => ({
    code: r['Department Code'] || r['Department Name'],
    name: r['Department Name'] || r['Department Code'],
    points: Number(r['Total Star Points']) || 0,
    avg: Number(r['Average SP / Student']) || 0,
    students: Number(r['Total Students']) || 0,
    marks: Number(r['Converted Internal Marks (Total)']) || 0
  }));

  const verticalDist = reportData?.vertical_distribution || [];
  const verticalPieData = verticalDist
    .map(v => ({
      name: v.code,
      fullName: v.name,
      value: Number(v.total_sp) || 0,
      participants: v.participants || 0,
      submissions: v.submissions || 0
    }))
    .filter(d => d.value > 0);

  const totalPoints = deptBarData.reduce((acc, d) => acc + d.points, 0);
  const totalStudents = deptBarData.reduce((acc, d) => acc + d.students, 0);
  const avgSP = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(1) : 0;
  const topDept = [...deptBarData].sort((a, b) => b.points - a.points)[0];

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
                <span className="badge" style={{ background: 'rgba(43,77,145,0.12)', color: 'var(--brand-blue)', fontWeight: 800 }}>
                  EXECUTIVE ACADEMIC REPORTING
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  • School Level Scope
                </span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Academic Performance Reports & Visual Benchmarking
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Generate, compare, and export official mark sheets, departmental benchmarks, and curriculum vertical matrices with rich visual charts.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => fetchReport(reportType)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              {rows.length > 0 && (
                <ExportButton
                  buttonText="Export Official Excel"
                  data={rows}
                  filename={`KPRCAS_Dean_${reportType}_${new Date().toISOString().slice(0,10)}`}
                  title={`KPRCAS Star Tracker — ${reportTitle}`}
                  columns={exportColumns}
                />
              )}
            </div>
          </div>

          {/* Report Type Selector Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {reportTabs.map(tab => {
              const Icon = tab.icon;
              const isSelected = reportType === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => { setReportType(tab.id); setSearchParams({ type: tab.id }); }}
                  className="glass-card"
                  style={{
                    padding: '1.1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isSelected ? '2px solid var(--brand-blue)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(43,77,145,0.06)' : 'var(--bg-card)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    boxShadow: isSelected ? '0 6px 16px rgba(43,77,145,0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: isSelected ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: isSelected ? 'var(--brand-blue)' : 'var(--text-primary)' }}>
                      {tab.label}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {tab.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* If Department Comparison is Selected: Render Comparative Visual Analytics Grid */}
          {reportType === 'department_comparison' && !loading && rows.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              {/* Benchmark Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL STAR POINTS</span>
                    <Award size={18} color="var(--brand-green)" />
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--brand-green)', marginTop: '0.4rem' }}>
                    {totalPoints.toLocaleString()} SP
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Accumulated across school</span>
                </div>

                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SCHOOL AVERAGE</span>
                    <TrendingUp size={18} color="var(--brand-blue)" />
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--brand-blue)', marginTop: '0.4rem' }}>
                    {avgSP} SP
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Per enrolled student</span>
                </div>

                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LEADING DEPARTMENT</span>
                    <Building size={18} color="#8b5cf6" />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {topDept ? topDept.name : '—'}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{topDept ? `${topDept.points} SP (${topDept.avg} SP/student)` : ''}</span>
                </div>

                <div className="glass-card" style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ENROLLED STUDENTS</span>
                    <Users size={18} color="#0ea5e9" />
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0ea5e9', marginTop: '0.4rem' }}>
                    {totalStudents}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Across {deptBarData.length} programmes</span>
                </div>
              </div>

              {/* Visual Comparison Charts (Side by Side) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
                
                {/* 1. Comparative Bar Chart: Total Points by Department */}
                <div className="glass-card" style={{ padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(32,142,71,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={16} color="var(--brand-green)" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Department Star Points Comparison
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Total SP accumulated by each department
                        </span>
                      </div>
                    </div>
                    <span className="badge" style={{ background: 'rgba(43,77,145,0.08)', color: 'var(--brand-blue)', fontWeight: 700, fontSize: '0.72rem' }}>
                      {deptBarData.length} Departments
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 340 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptBarData} margin={{ top: 25, right: 20, left: -10, bottom: 35 }}>
                        <XAxis 
                          dataKey="code" 
                          stroke="var(--border-color)"
                          tickLine={false} 
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                          tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 700 }}
                        />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div style={{
                                  background: 'var(--bg-secondary)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 8,
                                  padding: '0.75rem 1rem',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                  fontSize: '0.82rem'
                                }}>
                                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                                    {item.name} ({item.code})
                                  </div>
                                  <div style={{ color: 'var(--brand-green)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Total Points: {item.points} SP
                                  </div>
                                  <div style={{ color: 'var(--brand-blue)', fontWeight: 600, marginTop: '0.15rem' }}>
                                    Average / Student: {item.avg} SP
                                  </div>
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.3rem' }}>
                                    Enrolled Students: {item.students} • Converted Marks: {item.marks}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="points" radius={[6, 6, 0, 0]} name="Total Star Points">
                          <LabelList 
                            dataKey="points" 
                            position="top" 
                            fill="var(--text-primary)" 
                            fontSize={11} 
                            fontWeight={800} 
                            formatter={(v) => Number(v) > 0 ? `${v} SP` : '0'} 
                          />
                          {deptBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Donut / Pie Chart: Overall Vertical Distribution (V1 to V10) */}
                <div className="glass-card" style={{ padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(43,77,145,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PieChartIcon size={16} color="var(--brand-blue)" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Overall Vertical Distribution (V1 – V10)
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          School-wide breakdown across curriculum verticals
                        </span>
                      </div>
                    </div>
                    <span className="badge" style={{ background: 'rgba(32,142,71,0.08)', color: 'var(--brand-green)', fontWeight: 700, fontSize: '0.72rem' }}>
                      {verticalPieData.length} Verticals Active
                    </span>
                  </div>

                  {verticalPieData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4.5rem 1rem', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '0.85rem' }}>No approved Star Points across verticals recorded yet.</p>
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: 340 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={verticalPieData}
                            cx="50%"
                            cy="40%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {verticalPieData.map((entry, index) => (
                              <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const item = payload[0].payload;
                                const vertTotal = verticalPieData.reduce((a, b) => a + b.value, 0);
                                const pct = vertTotal > 0 ? ((item.value / vertTotal) * 100).toFixed(1) : 0;
                                return (
                                  <div style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 8,
                                    padding: '0.75rem 1rem',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    fontSize: '0.82rem'
                                  }}>
                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                                      {item.name}: {item.fullName}
                                    </div>
                                    <div style={{ color: 'var(--brand-green)', fontWeight: 700, fontSize: '0.9rem' }}>
                                      Awarded: {item.value} Star Points ({pct}%)
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.3rem' }}>
                                      Participants: {item.participants} students • Submissions: {item.submissions}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend 
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: 12 }}
                            formatter={(val, entry) => {
                              const item = verticalPieData.find(d => d.name === val) || entry?.payload;
                              const vertTotal = verticalPieData.reduce((a, b) => a + b.value, 0);
                              const pct = item && vertTotal > 0 ? ((item.value / vertTotal) * 100).toFixed(1) : '0.0';
                              return (
                                <span style={{ color: 'var(--text-primary)', fontSize: '0.74rem', fontWeight: 700, marginRight: 8, whiteSpace: 'nowrap' }}>
                                  {val} <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.70rem' }}>({pct}%)</span>
                                </span>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Report Data Table Preview Card */}
          <div className="glass-card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {reportTitle}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • {rows.length} Records
                </span>
              </div>

              {rows.length > 0 && (
                <ExportButton
                  buttonText="Download SpreadSheet"
                  data={rows}
                  filename={`KPRCAS_Dean_${reportType}_${new Date().toISOString().slice(0,10)}`}
                  title={`KPRCAS Star Tracker — ${reportTitle}`}
                  columns={exportColumns}
                />
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--brand-blue)' }} />
                <p style={{ fontSize: '0.85rem' }}>Generating institutional report...</p>
              </div>
            ) : rows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                <FileText size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No Report Data Found</h3>
                <p style={{ fontSize: '0.82rem' }}>No data records were generated for this report type.</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      {columns.map(col => (
                        <th key={col} style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                        {columns.map(col => {
                          const val = row[col];
                          const isNumeric = typeof val === 'number';
                          return (
                            <td key={col} style={{ padding: '0.75rem 1rem', fontWeight: col.includes('Name') || col.includes('Metric') ? 700 : (isNumeric ? 600 : 'normal') }}>
                              {val !== null && val !== undefined ? String(val) : '—'}
                            </td>
                          );
                        })}
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
