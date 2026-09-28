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
  ArrowUpRight
} from 'lucide-react';

export default function DeanSwot() {
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
      const res = await api.getDeanSwot();
      setSwotData(res);
    } catch (err) {
      console.error('Failed to load SWOT:', err);
    } finally {
      setLoading(false);
    }
  };

  const strengths = swotData?.strengths || [];
  const weaknesses = swotData?.weaknesses || [];
  const opportunities = swotData?.opportunities || [];
  const threats = swotData?.threats || [];

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
                <span className="badge" style={{ background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', fontWeight: 800 }}>
                  INSTITUTIONAL STRATEGY
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  • Academic Quality Assurance
                </span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Data-Driven Institutional SWOT Analysis
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Objective evaluation of academic achievements, participation gaps, bonus opportunities, and risk areas across the institution.
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--brand-green)' }} />
              <p>Analyzing institutional Star Tracker data...</p>
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
                        Core institutional competencies & high performance
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {strengths.map((s, idx) => (
                      <div key={idx} style={{
                        padding: '0.85rem',
                        borderRadius: 8,
                        background: 'rgba(16,185,129,0.04)',
                        border: '1px solid rgba(16,185,129,0.2)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.title}</h4>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(16,185,129,0.15)', color: '#059669' }}>
                            {s.metric}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.description}</p>
                      </div>
                    ))}
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
                        Participation gaps & under-performing verticals
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {weaknesses.map((w, idx) => (
                      <div key={idx} style={{
                        padding: '0.85rem',
                        borderRadius: 8,
                        background: 'rgba(245,158,11,0.04)',
                        border: '1px solid rgba(245,158,11,0.2)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{w.title}</h4>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(245,158,11,0.15)', color: '#d97706' }}>
                            {w.metric}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{w.description}</p>
                      </div>
                    ))}
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
                        Bonus point activities & high upside student cohorts
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {opportunities.map((o, idx) => (
                      <div key={idx} style={{
                        padding: '0.85rem',
                        borderRadius: 8,
                        background: 'rgba(14,165,233,0.04)',
                        border: '1px solid rgba(14,165,233,0.2)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{o.title}</h4>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(14,165,233,0.15)', color: '#0284c7' }}>
                            {o.metric}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. THREATS / RISK AREAS (T) */}
                <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#dc2626' }}>
                        Threats & Areas Requiring Attention (T)
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Pending approval backlogs & compliance deficits
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {threats.map((t, idx) => (
                      <div key={idx} style={{
                        padding: '0.85rem',
                        borderRadius: 8,
                        background: 'rgba(239,68,68,0.04)',
                        border: '1px solid rgba(239,68,68,0.2)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.title}</h4>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 800, background: 'rgba(239,68,68,0.15)', color: '#dc2626' }}>
                            {t.metric}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Executive Action Directives */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Dean's Strategic Academic Action Directives
                </h3>
                <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Institutional measures based on Star Tracker empirical performance metrics.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-green)' }}>
                      1. Verification Acceleration
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Instruct faculty advisors with pending queues exceeding 10 submissions to expedite reviews before monthly academic audits.
                    </p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
                      2. Under-Represented Vertical Drives
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Organize inter-departmental workshops for certifications (NPTEL, Coursera) and Innovation/Patents to boost institutional average.
                    </p>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b' }}>
                      3. Zero-Point Intervention
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Require class advisors to conduct 1-on-1 counseling for students currently holding 0 Star Points to ensure minimum mark thresholds.
                    </p>
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
