import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Layers, 
  Building2, 
  Users, 
  Trophy, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck,
  Award
} from 'lucide-react';

export default function PrincipalProgrammes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSchoolId = searchParams.get('school_id') || '';

  const [programmes, setProgrammes] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(initialSchoolId);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchProgrammes();
  }, [selectedSchool]);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSchool) params.school_id = selectedSchool;
      const res = await api.getPrincipalProgrammes(params);
      setProgrammes(res.programmes || []);
      if (res.schools && res.schools.length > 0) {
        setSchools(res.schools);
      }
    } catch (err) {
      console.error('Failed to load programmes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = (e) => {
    const val = e.target.value;
    setSelectedSchool(val);
    if (val) {
      setSearchParams({ school_id: val });
    } else {
      setSearchParams({});
    }
  };

  const filteredProgrammes = programmes.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase()) ||
    p.hod_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.school_name?.toLowerCase().includes(search.toLowerCase())
  );

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
                  background: 'rgba(43, 77, 145, 0.12)',
                  padding: '0.45rem',
                  borderRadius: 8,
                  color: '#2b4d91'
                }}>
                  <Layers size={22} />
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Programmes & Departments
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                College-wide directory of all 22 Academic Departments under their respective Schools & HODs
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={selectedSchool}
                onChange={handleSchoolChange}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: 8,
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

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search programme, HOD..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    width: 220
                  }}
                />
              </div>

              <button
                onClick={fetchProgrammes}
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
            </div>
          </div>

          {/* Programmes Table */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Programme</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>School</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Head of Department (HOD)</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Students</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Total Points</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Avg / Student</th>
                    <th style={{ padding: '0.9rem 1.1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Loading programmes...
                      </td>
                    </tr>
                  ) : filteredProgrammes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No programmes found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProgrammes.map((p) => (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '1rem 1.1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {p.name}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#208e47', fontWeight: 600 }}>
                            {p.code}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.1rem' }}>
                          <span style={{
                            background: 'rgba(43, 77, 145, 0.08)',
                            color: '#2b4d91',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.55rem',
                            borderRadius: 6
                          }}>
                            {p.school_code || p.school_name}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            <ShieldCheck size={16} color="#2b4d91" />
                            {p.hod_name || 'HOD'}
                          </div>
                          {p.hod_email && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {p.hod_email}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {(p.students_count ?? p.student_count ?? 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem 1.1rem', textAlign: 'right', fontWeight: 700, color: '#208e47', fontSize: '0.95rem' }}>
                          {(p.total_sp || 0).toLocaleString()} SP
                        </td>
                        <td style={{ padding: '1rem 1.1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {p.avg_sp || 0}
                        </td>
                        <td style={{ padding: '1rem 1.1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => navigate(`/principal/students?department_id=${p.id}`)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 6,
                                color: '#2b4d91',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Students
                            </button>
                            <button
                              onClick={() => navigate(`/principal/achievements?department_id=${p.id}`)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 6,
                                color: '#208e47',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Achievements
                            </button>
                          </div>
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
