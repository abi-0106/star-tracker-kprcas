import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, CheckCircle2, AlertCircle, Layers, Activity } from 'lucide-react';

export default function AdminRules() {
  const { user } = useAuth();
  const [ratio, setRatio] = useState(2);
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const [settingsRes, vertsRes] = await Promise.all([
        api.getAdminSettings().catch(() => ({})),
        api.getVerticals().catch(() => ({ verticals: [] }))
      ]);

      if (settingsRes && settingsRes.sp_to_marks_ratio) {
        setRatio(parseFloat(settingsRes.sp_to_marks_ratio));
      }
      const vertsList = Array.isArray(vertsRes) ? vertsRes : (vertsRes?.verticals || []);
      setVerticals(vertsList);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRatio = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');
      await api.updateAdminSettings({
        setting_key: 'sp_to_marks_ratio',
        setting_value: String(ratio),
        description: 'Star Points to Internal Marks conversion ratio'
      });
      setSuccessMsg(`Successfully updated conversion ratio to ${ratio} Star Points = 1 Internal Mark`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const userRole = user?.role || 'admin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole={userRole} role={userRole} />
        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Header */}
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)' }}>
            <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>RULES & SCORING ENGINE</span>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>Point & Mark Rules Configuration</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Configure institution-wide scoring metrics, conversion formulas, and vertical guidelines.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              <p>Loading Rules & Configurations...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Ratio Configuration Card */}
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(32,142,71,0.12)', color: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--brand-blue)' }}>Point Conversion Formula</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Configure how Star Points convert into academic Internal Marks</p>
                  </div>
                </div>

                {successMsg && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(32,142,71,0.1)', border: '1px solid rgba(32,142,71,0.3)', color: 'var(--brand-green)', borderRadius: 8, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}
                {errorMsg && (
                  <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#DC2626', borderRadius: 8, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveRatio} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem', maxWidth: 600 }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Star Points per 1 Internal Mark
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        step="0.5"
                        value={ratio}
                        onChange={(e) => setRatio(parseFloat(e.target.value))}
                        className="form-input"
                        style={{ width: 100, textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}
                        required
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Star Points = <strong style={{ color: 'var(--brand-green)' }}>1 Internal Mark</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.25rem' }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Update Formula'}</span>
                  </button>
                </form>
              </div>

              {/* Verticals Directory */}
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>10 Verticals Framework</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Curriculum verticals and activity point limits</p>
                  </div>
                  <Layers size={20} color="var(--brand-green)" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {verticals.map((v) => (
                    <div key={v.id} style={{ padding: '1rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: 'rgba(32,142,71,0.15)', color: 'var(--brand-green)' }}>
                          {v.code}
                        </span>
                        <span className={`badge badge-${v.type === 'Mandatory' ? 'mandatory' : 'optional'}`}>
                          {v.type} (Max {v.max_sp} SP)
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0.4rem 0 0.2rem 0', color: 'var(--text-primary)' }}>{v.name}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{v.description || 'Curriculum framework vertical'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
