import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Award, Layers, Users } from 'lucide-react';

export default function HodAnalytics() {
  const [stats, setStats] = useState(null);
  const [verticals, setVerticals] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [hodStats, verts, cls] = await Promise.all([
        api.get('/api/hod/stats'),
        api.get('/api/verticals'),
        api.get('/api/classes')
      ]);
      setStats(hodStats);
      setVerticals(verts || []);
      setClasses(cls || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = [
    { Metric: 'Total Students', Value: stats?.total_students || 0 },
    { Metric: 'Total Star Points Generated', Value: stats?.total_points || 0 },
    { Metric: 'Total Internal Marks Awarded', Value: stats?.total_marks || 0 },
    { Metric: 'Total Approved Submissions', Value: stats?.total_approved || 0 },
    { Metric: 'Pending Advisor Queue', Value: stats?.pending_reviews || 0 }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role="hod" />
        <main className="portal-main flex-1 p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Department Analytics</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Deep dive into departmental performance metrics and vertical distribution
              </p>
            </div>
            <ExportButton 
              data={exportData} 
              filename="Department_Analytics_Summary" 
              title="Department Performance & Metrics"
              columns={[
                { header: 'Metric', dataKey: 'Metric' },
                { header: 'Value', dataKey: 'Value' }
              ]}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Students</p>
                      <h3 className="text-2xl font-bold text-[var(--text-main)] mt-1">{stats?.total_students || 0}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Star Points Awarded</p>
                      <h3 className="text-2xl font-bold text-[var(--primary)] mt-1">{stats?.total_points || 0} SP</h3>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Internal Marks (2 SP = 1 Mark)</p>
                      <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.total_marks || 0} Marks</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Approved Records</p>
                      <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats?.total_approved || 0}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown by Verticals */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-main)]">10-Vertical Curriculum Framework</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Verticals active in student assessment & activity scoring</p>
                  </div>
                  <Layers className="w-5 h-5 text-[var(--primary)]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {verticals.map((v) => (
                    <div 
                      key={v.id} 
                      className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:border-[var(--primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--primary)] font-bold">
                          {v.code}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-medium">
                          Weight: {v.weightage || 10}%
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[var(--text-main)] mt-2">{v.name}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{v.description}</p>
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
