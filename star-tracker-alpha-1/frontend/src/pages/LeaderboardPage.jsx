import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trophy, Medal, Award, Flame, Search, Crown } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/leaderboard');
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = leaderboard.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportData = filtered.map((s, idx) => ({
    'Rank': s.rank || (idx + 1),
    'Roll Number': s.roll_no,
    'Student Name': s.name,
    'Class': s.class_name || 'N/A',
    'Star Points (SP)': s.total_points || 0,
    'Internal Marks (2 SP = 1 Mark)': s.total_marks || 0,
    'Approved Activities': s.approved_count || 0
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role={user?.role || 'student'} />
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-[var(--primary)] font-bold mb-1">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-xs uppercase tracking-wider">Institution Standings</span>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Star Tracker Leaderboard</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Top student performers recognized across verticals, activities, and internal marks
              </p>
            </div>

            <ExportButton 
              data={exportData} 
              filename={`Star_Tracker_Leaderboard_${new Date().toISOString().slice(0,10)}`}
              title="KPRCAS Star Tracker - Student Leaderboard"
              columns={[
                { header: 'Rank', dataKey: 'Rank' },
                { header: 'Roll Number', dataKey: 'Roll Number' },
                { header: 'Student Name', dataKey: 'Student Name' },
                { header: 'Class', dataKey: 'Class' },
                { header: 'Star Points (SP)', dataKey: 'Star Points (SP)' },
                { header: 'Internal Marks', dataKey: 'Internal Marks (2 SP = 1 Mark)' }
              ]}
            />
          </div>

          {/* Top 3 Podium Cards */}
          {!loading && leaderboard.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-4">
              {/* Rank 2 */}
              <div className="bg-[var(--bg-card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm order-2 md:order-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-300"></div>
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center font-bold text-xl mb-3">
                  <Medal className="w-8 h-8 text-slate-400" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs mb-2">
                  #2 SILVER
                </span>
                <h3 className="font-bold text-lg text-[var(--text-main)]">{leaderboard[1].name}</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">{leaderboard[1].roll_no}</p>
                <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                  <div className="text-xl font-bold text-[var(--primary)]">{leaderboard[1].total_points} SP</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {leaderboard[1].total_marks} Marks
                  </div>
                </div>
              </div>

              {/* Rank 1 */}
              <div className="bg-[var(--bg-card)] border-2 border-amber-400/60 rounded-2xl p-6 text-center shadow-md order-1 md:order-2 relative overflow-hidden -translate-y-2 bg-gradient-to-b from-amber-500/5 to-transparent">
                <div className="absolute top-0 left-0 right-0 h-2 bg-amber-400"></div>
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 mx-auto flex items-center justify-center font-bold text-2xl mb-3 shadow-inner">
                  <Crown className="w-10 h-10 text-amber-500" />
                </div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold text-xs mb-2">
                  👑 #1 CHAMPION
                </span>
                <h3 className="font-bold text-xl text-[var(--text-main)]">{leaderboard[0].name}</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">{leaderboard[0].roll_no}</p>
                <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/40">
                  <div className="text-2xl font-black text-amber-500">{leaderboard[0].total_points} SP</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    {leaderboard[0].total_marks} Marks Awarded
                  </div>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="bg-[var(--bg-card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm order-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-amber-700/50"></div>
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 mx-auto flex items-center justify-center font-bold text-xl mb-3">
                  <Medal className="w-8 h-8 text-amber-700" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-xs mb-2">
                  #3 BRONZE
                </span>
                <h3 className="font-bold text-lg text-[var(--text-main)]">{leaderboard[2].name}</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">{leaderboard[2].roll_no}</p>
                <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                  <div className="text-xl font-bold text-[var(--primary)]">{leaderboard[2].total_points} SP</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {leaderboard[2].total_marks} Marks
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Search leaderboard by student name, roll number, or class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Full Standings Table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)] text-xs uppercase font-semibold text-[var(--text-muted)]">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-center">Approved Certs</th>
                    <th className="py-3 px-4 text-center">Star Points (SP)</th>
                    <th className="py-3 px-4 text-center">Internal Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-[var(--text-muted)]">
                        No students on leaderboard yet.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s, idx) => (
                      <tr 
                        key={s.id} 
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                          user?.id === s.id ? 'bg-[var(--primary-subtle)] font-medium' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          {idx === 0 ? <span className="font-bold text-amber-500 text-base">🥇 1</span> :
                           idx === 1 ? <span className="font-bold text-slate-400 text-base">🥈 2</span> :
                           idx === 2 ? <span className="font-bold text-amber-700 text-base">🥉 3</span> :
                           <span className="font-mono text-xs text-[var(--text-muted)] font-semibold">{idx + 1}</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[var(--text-main)]">
                            {s.name} {user?.id === s.id && <span className="text-xs text-[var(--primary)] font-normal">(You)</span>}
                          </div>
                          <div className="font-mono text-xs text-[var(--text-muted)]">{s.roll_no}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[var(--text-muted)] text-xs">
                          {s.class_name || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium">
                          {s.approved_count || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[var(--primary)]">
                          {s.total_points || 0} SP
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {s.total_marks || 0} Marks
                          </span>
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
