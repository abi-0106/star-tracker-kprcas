import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Award, FileCheck, Users, Building, Settings, ShieldCheck, Trophy, Layers, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ userRole, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = {
    student: [
      { label: 'Dashboard',            href: '/student/dashboard',    icon: LayoutDashboard },
      { label: 'Submit Certificate',    href: '/student/submit',       icon: Award },
      { label: 'Certificate History',   href: '/student/certificates', icon: FileCheck },
      { label: 'Verticals Breakdown',   href: '/student/verticals',    icon: Layers },
      { label: 'Leaderboard',           href: '/leaderboard',          icon: Trophy },
    ],
    advisor: [
      { label: 'Advisor Dashboard',     href: '/advisor/dashboard',   icon: LayoutDashboard },
      { label: 'Pending Review Queue',  href: '/advisor/queue',        icon: FileCheck },
      { label: 'Student Roster',        href: '/advisor/students',     icon: Users },
      { label: 'Class Analytics',       href: '/advisor/analytics',    icon: Trophy },
      { label: 'Leaderboard',           href: '/leaderboard',          icon: Trophy },
    ],
    hod: [
      { label: 'Department Dashboard',  href: '/hod/dashboard',        icon: LayoutDashboard },
      { label: 'Advisor Cards & Roster', href: '/hod/advisors',        icon: Users },
      { label: 'Department Analytics',  href: '/hod/analytics',        icon: Building },
      { label: 'Reports',               href: '/hod/reports',          icon: FileText },
      { label: 'Leaderboard',           href: '/leaderboard',          icon: Trophy },
    ],
    admin: [
      { label: 'Admin Portal',          href: '/admin/dashboard',      icon: LayoutDashboard },
      { label: 'Rules & Verticals Engine', href: '/admin/rules',       icon: Settings },
      { label: 'Manage Users & Roles',  href: '/admin/users',          icon: Users },
      { label: 'Audit Logs',            href: '/admin/audit',          icon: ShieldCheck },
    ],
  };

  const activeRole = userRole || role || user?.role || 'student';
  const currentItems = navItems[activeRole] || navItems.student;

  const roleLabel = {
    student: 'Student Portal',
    advisor: 'Advisor Portal',
    hod:     'HOD Portal',
    admin:   'Admin Portal',
  };

  return (
    <aside style={{
      width: 252,
      height: 'calc(100vh - 64px)',
      position: 'sticky',
      top: 64,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.25rem 0.85rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      overflowY: 'auto',
      zIndex: 40,
    }}>
      <div>
        {/* Role Label */}
        <div style={{ marginBottom: '1.25rem', padding: '0 0.5rem' }}>
          <p style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--brand-green)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {roleLabel[userRole] || 'Portal'}
          </p>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {currentItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.href}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--brand-green)' : 'transparent',
                  transition: 'all 0.18s ease',
                  textDecoration: 'none',
                })}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 8,
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#DC2626',
          background: 'rgba(220, 38, 38, 0.08)',
          width: '100%',
        }}
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
