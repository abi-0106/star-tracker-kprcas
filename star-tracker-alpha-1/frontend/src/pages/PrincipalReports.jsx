import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { 
  FileText, 
  Building2, 
  Layers, 
  Users, 
  Download, 
  RefreshCw,
  Award,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  Filter
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

export default function PrincipalReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'college_summary';

  const [reportType, setReportType] = useState(initialType);
  const [reportData, setReportData] = useState(null);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType, selectedSchool, selectedDept]);

  const fetchReport = async (type) => {
    try {
      setLoading(true);
      const params = { type };
      if (selectedSchool) params.school_id = selectedSchool;
      if (selectedDept) params.department_id = selectedDept;

      const res = await api.getPrincipalReports(params);
      setReportData(res);
      if (res.schools && res.schools.length > 0) setSchools(res.schools);
      if (res.departments && res.departments.length > 0) setDepartments(res.departments);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (type) => {
    setReportType(type);
    setSearchParams({ type });
  };

  const rows = reportData?.data || [];
  const reportTitle = reportData?.title || 'College Executive Report';

  // Format columns for table and export
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const exportColumns = columns.map(col => ({
    header: col,
    dataKey: col
  }));

  const reportTabs = [
    { id: 'college_summary', label: 'College Executive Summary', icon: FileText, desc: 'Institution-wide summary across all 6 Academic Schools' },
    { id: 'school_report', label: 'School Comparison Report', icon: Building2, desc: 'School-by-school metrics, Deans & total points' },
    { id: 'programme_report', label: 'Programme Performance Report', icon: Layers, desc: 'Department-level breakdown across all 22 programmes' },
    { id: 'student_achievement', label: 'Student Achievements Ledger', icon: Award, desc: 'Verified achievement roster and point distributions' },
  ];

  const filteredDepts = selectedSchool
    ? departments.filter(d => String(d.school_id) === String(selectedSchool))
    : departments;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="principal" role="principal" />

        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1440, width: '100%' }}>
          
          {/* Header */}
          <div style={{ 
            marginBottom: '1.75rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1.5rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div style={{
                  background: 'rgba(32, 142, 71, 0.12)',
                  padding: '0.45rem',
                  borderRadius: 8,
                  color: '#208e47'
                }}>
                  <FileText size={22} />
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Principal Executive Reports & Audits
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Official institution-wide analytics and audit reports ready for export (.xlsx)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => fetchReport(reportType)}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.9rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
                Refresh
              </button>

              <ExportButton
                data={rows}
                columns={exportColumns}
                filename={`Principal_${reportType}_${new Date().toISOString().slice(0, 10)}`}
                title={reportTitle}
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            {reportTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = reportType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    padding: '1.1rem 1.25rem',
                    background: isActive ? 'linear-gradient(135deg, rgba(32, 142, 71, 0.08) 0%, rgba(43, 77, 145, 0.08) 100%)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${isActive ? '#208e47' : 'var(--border-color)'}`,
                    borderRadius: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 2px 8px rgba(32, 142, 71, 0.15)' : 'none'
                  }}
                >
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: 8,
                    background: isActive ? '#208e47' : 'var(--bg-primary)',
                    color: isActive ? '#fff' : 'var(--text-secondary)'
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isActive ? '#208e47' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {tab.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {tab.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional Filter Controls (for Student and Programme Reports) */}
          {(reportType === 'programme_report' || reportType === 'student_achievement') && (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: '0.85rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Filter size={15} /> Scope Filters:
              </span>

              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  setSelectedDept('');
                }}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                <option value="">All Academic Schools</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 6,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                <option value="">All Programmes</option>
                {filteredDepts.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Report Data Card & Table */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {reportTitle}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Total records found: <strong style={{ color: 'var(--text-primary)' }}>{rows.length}</strong>
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Generating report data...
              </div>
            ) : rows.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No records available for the current filter criteria.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                      {columns.map(col => (
                        <th key={col} style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr 
                        key={index}
                        style={{ borderBottom: '1px solid var(--border-color)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {columns.map(col => {
                          const val = row[col];
                          const isPoints = col.toLowerCase().includes('points') || col.toLowerCase().includes('sp');
                          return (
                            <td 
                              key={col} 
                              style={{ 
                                padding: '0.85rem 1rem', 
                                color: isPoints ? '#208e47' : 'var(--text-primary)',
                                fontWeight: isPoints ? 700 : 500
                              }}
                            >
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
