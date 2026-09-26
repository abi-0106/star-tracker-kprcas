import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';
import { 
  Users, Award, Settings, ShieldCheck, Database, 
  Layers, CheckCircle, Clock, FileCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="portal-main flex-1 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-main)]">System Administration</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Institution-wide Star Tracker configuration, user management, and audit controls
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Institution Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Users</p>
                      <h3 className="text-2xl font-bold text-[var(--text-main)] mt-1">{stats?.total_users || 0}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] pt-3">
                    <span>{stats?.students_count || 0} Students</span>
                    <span>{stats?.advisors_count || 0} Faculty</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Star Points</p>
                      <h3 className="text-2xl font-bold text-[var(--primary)] mt-1">{stats?.total_points || 0} SP</h3>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium border-t border-[var(--border-color)] pt-3">
                    = {stats?.total_marks || 0} Internal Marks Awarded
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Approved Certs</p>
                      <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.approved_submissions || 0}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                      <FileCheck className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] pt-3">
                    Verified student achievements
                  </div>
                </div>

                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Pending Review</p>
                      <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats?.pending_reviews || 0}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] pt-3">
                    Submissions awaiting verification
                  </div>
                </div>
              </div>

              {/* Management Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link 
                  to="/admin/users" 
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 hover:border-[var(--primary)] transition-all shadow-sm group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                    User Management
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Manage students, faculty advisors, HODs, and administrative permissions.
                  </p>
                </Link>

                <Link 
                  to="/admin/rules" 
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 hover:border-[var(--primary)] transition-all shadow-sm group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                    Point & Mark Rules
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Configure SP-to-mark conversion ratio, verticals, activity levels, and score caps.
                  </p>
                </Link>

                <Link 
                  to="/admin/audit" 
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 hover:border-[var(--primary)] transition-all shadow-sm group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                    System Audit Logs
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Track all approval transactions, modifications, and security events.
                  </p>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
