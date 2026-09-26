import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Search, Filter, Shield, Award, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.email?.toLowerCase().includes(search.toLowerCase()) ||
                          u.reg_no_emp_id?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const exportData = filteredUsers.map(u => ({
    'Name': u.name,
    'Email': u.email,
    'Role': u.role?.toUpperCase(),
    'Roll / Staff ID': u.reg_no_emp_id || 'N/A',
    'Department': u.department_name || 'N/A',
    'Class': u.class_name ? `${u.class_name} - ${u.class_section || ''}` : 'N/A',
    'Status': u.status === 'active' ? 'Active' : 'Inactive'
  }));

  const userRole = user?.role || 'admin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole={userRole} role={userRole} />
        <main className="portal-main" style={{ flex: 1, padding: '2rem', maxWidth: 1400 }}>
          {/* Header Banner */}
          <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(32,142,71,0.1), rgba(43,77,145,0.1))', border: '1px solid rgba(32,142,71,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-mandatory" style={{ marginBottom: '0.5rem' }}>USER ROLES & ACCOUNTS</span>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', color: 'var(--brand-blue)' }}>User Management</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                View, filter, search, and export registered user accounts across the institution.
              </p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
          </div>

          {/* Search and Filters */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or roll/staff ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={15} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role:</span>
                </div>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', minWidth: 160 }}
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="advisor">Class Advisors</option>
                  <option value="hod">HODs</option>
                  <option value="dean">Deans</option>
                  <option value="principal">Principal</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="glass-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
                <p>Loading User Accounts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No Users Found</h3>
                <p>No user accounts match the search criteria.</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>User</th>
                      <th style={{ padding: '0.75rem' }}>Role</th>
                      <th style={{ padding: '0.75rem' }}>Roll / Emp ID</th>
                      <th style={{ padding: '0.75rem' }}>Department & Class</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: u.role === 'admin' ? 'rgba(220,38,38,0.12)' : (u.role === 'advisor' ? 'rgba(43,77,145,0.12)' : 'rgba(32,142,71,0.12)'),
                            color: u.role === 'admin' ? '#DC2626' : (u.role === 'advisor' ? 'var(--brand-blue)' : 'var(--brand-green)'),
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--brand-blue)' }}>
                          {u.reg_no_emp_id || '—'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <div>{u.department_name || '—'}</div>
                          {u.class_name && <div style={{ fontWeight: 600, color: 'var(--brand-green)', fontSize: '0.75rem' }}>{u.class_name} {u.class_section ? `- Sec ${u.class_section}` : ''}</div>}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          {u.status === 'active' ? (
                            <span style={{ color: 'var(--brand-green)', fontWeight: 600, fontSize: '0.78rem' }}>Active</span>
                          ) : (
                            <span style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.78rem' }}>Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
