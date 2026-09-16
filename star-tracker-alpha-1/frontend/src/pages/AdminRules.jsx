import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { Settings, Save, CheckCircle2, AlertCircle, Layers, Activity } from 'lucide-react';

export default function AdminRules() {
  const [ratio, setRatio] = useState(2);
  const [verticals, setVerticals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const [settingsRes, vertsRes, actsRes, lvlsRes] = await Promise.all([
        api.get('/api/admin/settings'),
        api.get('/api/verticals'),
        api.get('/api/activities'),
        api.get('/api/activity-levels')
      ]);
      if (settingsRes.sp_to_marks_ratio) {
        setRatio(parseFloat(settingsRes.sp_to_marks_ratio));
      }
      setVerticals(vertsRes || []);
      setActivities(actsRes || []);
      setLevels(lvlsRes || []);
    } catch (err) {
      console.error(err);
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
      await api.post('/api/admin/settings', {
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

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Point & Mark Rules Configuration</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Configure institution scoring metrics, conversion formulas, and vertical guidelines
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Ratio Configuration Card */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-main)]">Point Conversion Ratio</h2>
                    <p className="text-xs text-[var(--text-muted)]">Configure how Star Points convert into academic Internal Marks</p>
                  </div>
                </div>

                {successMsg && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveRatio} className="flex flex-col sm:flex-row items-end gap-4 max-w-xl">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">
                      Star Points per 1 Internal Mark
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        step="0.5"
                        value={ratio}
                        onChange={(e) => setRatio(parseFloat(e.target.value))}
                        className="w-32 px-4 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] font-bold text-center text-lg focus:outline-none focus:border-[var(--primary)]"
                        required
                      />
                      <span className="text-sm text-[var(--text-muted)]">
                        Star Points = <strong className="text-[var(--text-main)]">1 Internal Mark</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2 px-6 py-2.5"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Update Ratio'}
                  </button>
                </form>
              </div>

              {/* Verticals Directory */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-main)]">10 Verticals Framework</h2>
                    <p className="text-xs text-[var(--text-muted)]">Curriculum verticals and activity distribution</p>
                  </div>
                  <Layers className="w-5 h-5 text-[var(--primary)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verticals.map((v) => (
                    <div key={v.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--primary)]">
                          {v.code}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">Weight: {v.weightage || 10}%</span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--text-main)] mt-2">{v.name}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{v.description}</p>
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
