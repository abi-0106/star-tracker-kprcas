import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Target, 
  CheckCircle2, 
  Clock, 
  Zap,
  ArrowUpRight,
  Building,
  Users,
  Award
} from 'lucide-react';

export default function HodSwot() {
  const [swotData, setSwotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchSwot();
  }, []);

  const fetchSwot = async () => {
    try {
      setLoading(true);
      const res = await api.getHodSwot();
      setSwotData(res);
    } catch (err) {
      console.error('Failed to load HOD SWOT:', err);
    } finally {
      setLoading(false);
    }
  };

  const department = swotData?.department;
  const stats = swotData?.stats;
  const strengths = swotData?.strengths || [];
  const weaknesses = swotData?.weaknesses || [];
  const opportunities = swotData?.opportunities || [];
  const threats = swotData?.threats || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="hod" role="hod" />

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
                <span className="badge" style={{ background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', fontWeight: 800 }}>
                  DEPARTMENTAL STRATEGY
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  • {department ? `${department.name} (${department.code})` : 'Programme Level Scope'}
                </span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Department Strategic SWOT Analysis
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Objective evaluation of departmental student cohorts, vertical engagement, high-upside bonus activities, and verification backlogs.
              </p>
            </div>

            <button
              onClick={fetchSwot}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Analysis</span>
            </button>
          </div>

          {/* Department Benchmark KPIs */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL DEPARTMENT SP</span>
                  <Award size={18} color="var(--brand-green)" />
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--brand-green)', marginTop: '0.4rem' }}>
                  {stats.total_sp.toLocaleString()} SP
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Accumulated across all classes</span>
              </div>

              <div className="glass-card" style={{ padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DEPARTMENT AVERAGE</span>
                  <TrendingUp size={18} color="var(--brand-blue)" />
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--brand-blue)', marginTop: '0.4rem' }}>
                  {stats.avg_sp} SP
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Per enrolled student</span>
              </div>

              <div className="glass-card" style={{ padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ENROLLED STUDENTS</span>
                  <Users size={18} color="#0ea5e9" />
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0ea5e9', marginTop: '0.4rem' }}>
                  {stats.total_students}
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Across {stats.total_classes} class sections</span>
              </div>

              <div className="glass-card" style={{ padding: '1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE COHORTS</span>
                  <Building size={18} color="#8b5cf6" />
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.4rem' }}>
                  {stats.total_classes} Classes
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Managed by Class Advisors</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--brand-green)' }} />
              <p>Analyzing departmental Star Tracker data...</p>
            </div>
          ) : (
            <div>
              {/* 4 Quadrants Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                
                {/* 1. STRENGTHS (S) */}
                <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>
                        Strengths (S)
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Department core competencies & high performance
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {strengths.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No strong indicators identified yet.</p>
                    ) : (
                      strengths.map((s, idx) => (
                        <div key={idx} style={{
                          padding: '0.85rem',
                          borderRadius: 8,
                          background: 'rgba(16,185,129,0.04)',
                          border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.title}</h4>
                            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(16,185,129,0.15)', color: '#059669', whiteSpace: 'nowrap' }}>
                              {s.metric}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. WEAKNESSES (W) */}
                <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#d97706' }}>
                        Weaknesses (W)
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Participation deficits & lagging cohorts
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {weaknesses.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No major weaknesses identified.</p>
                    ) : (
                      weaknesses.map((w, idx) => (
                        <div key={idx} style={{
                          padding: '0.85rem',
                          borderRadius: 8,
                          background: 'rgba(245,158,11,0.04)',
                          border: '1px solid rgba(245,158,11,0.2)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{w.title}</h4>
                            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(245,158,11,0.15)', color: '#d97706', whiteSpace: 'nowrap' }}>
                              {w.metric}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{w.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. OPPORTUNITIES (O) */}
                <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #0ea5e9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>
                        Opportunities (O)
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Bonus accelerators & cohort growth areas
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {opportunities.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No additional growth opportunities identified.</p>
                    ) : (
                      opportunities.map((o, idx) => (
                        <div key={idx} style={{
                          padding: '0.85rem',
                          borderRadius: 8,
                          background: 'rgba(14,165,233,0.04)',
                          border: '1px solid rgba(14,165,233,0.2)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{o.title}</h4>
                            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(14,165,233,0.15)', color: '#0284c7', whiteSpace: 'nowrap' }}>
                              {o.metric}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. THREATS (T) */}
                <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#dc2626' }}>
                        Threats & Risks (T)
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Advisor backlogs & mandatory compliance gaps
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {threats.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No compliance risks or review backlogs found.</p>
                    ) : (
                      threats.map((t, idx) => (
                        <div key={idx} style={{
                          padding: '0.85rem',
                          borderRadius: 8,
                          background: 'rgba(239,68,68,0.04)',
                          border: '1px solid rgba(239,68,68,0.2)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.title}</h4>
                            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(239,68,68,0.15)', color: '#dc2626', whiteSpace: 'nowrap' }}>
                              {t.metric}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
