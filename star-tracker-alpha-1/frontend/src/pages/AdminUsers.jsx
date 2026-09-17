import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { Users, UserPlus, Search, Filter, Shield, Award, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.email?.toLowerCase().includes(search.toLowerCase()) ||
                          u.roll_no?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportData = filteredUsers.map(u => ({
    'Name': u.name,
    'Email': u.email,
    'Role': u.role?.toUpperCase(),
    'Roll / Staff ID': u.roll_no || u.staff_id || 'N/A',
    'Department': u.dept_name || 'N/A',
    'Class': u.class_name || 'N/A',
    'Status': u.is_active ? 'Active' : 'Inactive'
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="portal-main flex-1 p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">User Management</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                View, filter, and export user accounts across the institution
              </p>
            </div>
            <ExportButton 
              data={exportData} 
              filename="KPRCAS_Users_List" 
              title="KPRCAS Star Tracker - Registered Users"
              columns={[
                { header: 'Name', dataKey: 'Name' },
                { header: 'Email', dataKey: 'Email' },
                { header: 'Role', dataKey: 'Role' },
                { header: 'Roll/Staff ID', dataKey: 'Roll / Staff ID' },
                { header: 'Department', dataKey: 'Department' },
                { header: 'Class', dataKey: 'Class' },
                { header: 'Status', dataKey: 'Status' }
              ]}
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Search by name, email, or roll/staff ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-44 py-2 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="advisor">Class Advisors</option>
                <option value="hod">HODs</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)] text-xs uppercase font-semibold text-[var(--text-muted)]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Identifier</th>
                    <th className="py-3 px-4">Department / Class</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-[var(--text-muted)]">
                        No users found matching the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[var(--text-main)]">{u.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                            u.role === 'hod' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                            u.role === 'advisor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">
                          {u.roll_no || u.staff_id || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">
                          <div>{u.dept_name || '—'}</div>
                          {u.class_name && <div className="text-[11px] text-[var(--primary)] font-medium">{u.class_name}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-medium">
                              <XCircle className="w-3.5 h-3.5" /> Inactive
                            </span>
                          )}
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
