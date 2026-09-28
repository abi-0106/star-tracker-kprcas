import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Building2, 
  Layers, 
  Users, 
  Trophy, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Search, 
  RefreshCw,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function PrincipalSchools() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedSchoolId, setExpandedSchoolId] = useState(null);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await api.getPrincipalSchools();
      setSchools(res.schools || []);
    } catch (err) {
      console.error('Failed to load schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase()) ||
    s.dean_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpandedSchoolId(prev => (prev === id ? null : id));
  };

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
                  <Building2 size={22} />
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Academic Schools Directory
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                College organizational structure: 6 Schools under Academic Deans
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search school or dean..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    width: 240
                  }}
                />
              </div>

              <button
                onClick={fetchSchools}
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

          {/* Schools List Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading schools directory...
            </div>
          ) : filteredSchools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 12 }}>
              No schools matched your search query.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredSchools.map((school) => {
                const isExpanded = expandedSchoolId === school.id;
                return (
                  <div
                    key={school.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 14,
                      padding: '1.4rem 1.6rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {/* Main School Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                          <span style={{
                            background: 'rgba(32, 142, 71, 0.12)',
                            color: '#208e47',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 6
                          }}>
                            {school.code}
                          </span>
                          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {school.name}
                          </h2>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <ShieldCheck size={16} color="#2b4d91" />
                          <span>Dean: <strong style={{ color: 'var(--text-primary)' }}>{school.dean_name}</strong></span>
                          {school.dean_email && (
                            <span style={{ opacity: 0.75 }}>({school.dean_email})</span>
                          )}
                        </div>
                      </div>

                      {/* Stat Pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Programmes
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {school.programmes_count || 0}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Students
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {(school.students_count || 0).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Total Points
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#208e47' }}>
                            {(school.total_sp || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SP</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                            Avg / Student
                          </div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2b4d91' }}>
                            {school.avg_sp || 0}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => toggleExpand(school.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.45rem 0.85rem',
                              background: isExpanded ? 'rgba(43, 77, 145, 0.1)' : 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 8,
                              color: '#2b4d91',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            {isExpanded ? 'Hide Depts' : 'View Depts'}
                          </button>

                          <button
                            onClick={() => navigate(`/principal/programmes?school_id=${school.id}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.45rem 0.85rem',
                              background: 'linear-gradient(135deg, #208e47 0%, #2b4d91 100%)',
                              border: 'none',
                              borderRadius: 8,
                              color: '#fff',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Explore <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Department List */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '1.25rem',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid var(--border-color)'
                      }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.85rem 0' }}>
                          Programmes & Departments in {school.name}:
                        </h4>

                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Department Code</th>
                                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Programme Name</th>
                                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>HOD In-Charge</th>
                                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Students</th>
                                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Total Star Points</th>
                                <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(!school.programmes || school.programmes.length === 0) ? (
                                <tr>
                                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No programmes listed in this school.
                                  </td>
                                </tr>
                              ) : (
                                school.programmes.map((prog) => (
                                  <tr key={prog.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600, color: '#208e47' }}>
                                      {prog.code}
                                    </td>
                                    <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                      {prog.name}
                                    </td>
                                    <td style={{ padding: '0.65rem 0.8rem', color: 'var(--text-secondary)' }}>
                                      {prog.hod_name || 'Assigned HOD'}
                                    </td>
                                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                                      {(prog.students_count || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right', fontWeight: 700, color: '#208e47' }}>
                                      {(prog.total_sp || 0).toLocaleString()} SP
                                    </td>
                                    <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                                      <button
                                        onClick={() => navigate(`/principal/students?department_id=${prog.id}`)}
                                        style={{
                                          padding: '0.25rem 0.6rem',
                                          background: 'transparent',
                                          border: '1px solid var(--border-color)',
                                          borderRadius: 4,
                                          color: '#2b4d91',
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Students
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
