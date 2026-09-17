import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { Layers, Award, CheckCircle2, Star } from 'lucide-react';
import { api } from '../services/api';

export default function StudentVerticals() {
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    api.getVerticals()
      .then(data => {
        if (data && data.verticals) setVerticals(data.verticals);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />

      <div style={{ display: 'flex' }}>
        <Sidebar userRole="student" />

        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Header */}
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>STAR FRAMEWORK RULES</span>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>Verticals V1 – V10 & Activity Rules</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Explore official point limits, levels (Entry to Expert), bonus eligibility (★), and mandatory requirements.
              </p>
            </div>

            <ExportButton
              buttonText="Export Framework Rules"
              getExportOptions={() => ({
                title: 'STAR Activity Framework — Verticals & Rules',
                fileName: 'STAR_Framework_Verticals',
                columns: [
                  { header: 'Code', key: 'code' },
                  { header: 'Vertical Name', key: 'name' },
                  { header: 'Type', key: 'type' },
                  { header: 'Min SP', key: 'min_sp', formatter: val => `${val} SP` },
                  { header: 'Max Cap SP', key: 'max_sp', formatter: val => `${val} SP` },
                  { header: 'Bonus Max SP', key: 'bonus_max_sp', formatter: val => `${val} SP` },
                  { header: 'Extended Max SP', key: 'extended_max_sp', formatter: val => `${val} SP` },
                ],
                data: verticals,
              })}
            />
          </div>

          {/* Verticals Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {verticals.map(v => (
              <div key={v.id} className="glass-card" style={{ borderTop: `4px solid ${v.type === 'Mandatory' ? 'var(--brand-blue)' : 'var(--brand-green)'}` }}>
                {/* Vertical Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{v.code}</span>
                      <span className={`badge badge-${v.type.toLowerCase()}`}>{v.type}</span>
                    </div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{v.name}</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{v.description}</p>
                  </div>

                  {/* Points Specs */}
                  <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.5rem 0.85rem', borderRadius: 8, fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Min Required</span>
                      <strong>{v.min_sp} SP</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Regular Max</span>
                      <strong>{v.max_sp} SP</strong>
                    </div>
                    {v.bonus_max_sp > 0 && (
                      <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Bonus Max</span>
                        <strong style={{ color: '#D97706' }}>+{v.bonus_max_sp} SP</strong>
                      </div>
                    )}
                    <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Extended Max</span>
                      <strong style={{ color: 'var(--brand-green)' }}>{v.extended_max_sp} SP</strong>
                    </div>
                  </div>
                </div>

                {/* Activities inside Vertical */}
                {v.activities && v.activities.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {v.activities.map(a => (
                      <div key={a.id} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '0.85rem 1rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                            Activity {a.activity_no}: {a.name}
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {a.is_bonus_eligible && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', background: 'rgba(217, 119, 6, 0.12)', padding: '2px 6px', borderRadius: 4 }}>
                                ★ Bonus Eligible
                              </span>
                            )}
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                              Max: {a.max_sp} SP
                            </span>
                          </div>
                        </div>

                        {/* Level Tier Pills */}
                        {a.levels && a.levels.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {a.levels.map(lvl => (
                              <div key={lvl.id} style={{ background: 'var(--bg-card)', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                  <span>{lvl.level_name}</span>
                                  <span style={{ color: 'var(--brand-green)' }}>+{lvl.sp_points} SP</span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{lvl.description}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
