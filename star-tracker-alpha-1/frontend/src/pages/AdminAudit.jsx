import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/audit-logs');
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    return l.action?.toLowerCase().includes(search.toLowerCase()) || 
           l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
           l.entity_type?.toLowerCase().includes(search.toLowerCase());
  });

  const exportData = filteredLogs.map(l => ({
    'Timestamp': new Date(l.created_at).toLocaleString(),
    'User': l.user_name || 'System',
    'Action': l.action,
    'Entity': l.entity_type,
    'Entity ID': l.entity_id || 'N/A',
    'Details': l.details || ''
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">System Audit Trail</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Immutable audit log of all system approvals, modifications, and user actions
              </p>
            </div>
            <ExportButton 
              data={exportData} 
              filename="Star_Tracker_Audit_Logs" 
              title="KPRCAS Star Tracker - System Audit Trail"
              columns={[
                { header: 'Timestamp', dataKey: 'Timestamp' },
                { header: 'User', dataKey: 'User' },
                { header: 'Action', dataKey: 'Action' },
                { header: 'Entity', dataKey: 'Entity' },
                { header: 'Details', dataKey: 'Details' }
              ]}
            />
          </div>

          {/* Search */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Search audit trail by user, action, or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)] text-xs uppercase font-semibold text-[var(--text-muted)]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-[var(--text-muted)]">
                        No audit records recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[var(--text-main)]">
                          {log.user_name || 'System'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            log.action?.includes('APPROVE') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            log.action?.includes('REJECT') ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                          {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[var(--text-muted)] max-w-md truncate">
                          {log.details || '—'}
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
