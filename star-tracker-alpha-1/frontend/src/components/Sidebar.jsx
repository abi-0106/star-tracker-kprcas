import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Award, FileCheck, Users, Building, Settings, ShieldCheck, Trophy, Layers, FileText, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ userRole, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
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
    dean: [
      { label: 'Academic Dashboard',    href: '/hod/dashboard',        icon: LayoutDashboard },
      { label: 'Advisor Cards & Roster', href: '/hod/advisors',        icon: Users },
      { label: 'Department Analytics',  href: '/hod/analytics',        icon: Building },
      { label: 'Reports',               href: '/hod/reports',          icon: FileText },
      { label: 'Leaderboard',           href: '/leaderboard',          icon: Trophy },
    ],
    principal: [
      { label: 'Executive Dashboard',   href: '/hod/dashboard',        icon: LayoutDashboard },
      { label: 'Advisor Cards & Roster', href: '/hod/advisors',        icon: Users },
      { label: 'Institution Analytics', href: '/hod/analytics',        icon: Building },
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
    advisor: 'Class Advisor Portal',
    hod:     'HOD Department Portal',
    dean:    'Dean Academic Portal',
    principal: 'Principal Portal',
    admin:   'Admin Portal',
  };

  return (
    <>
      {isOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`} style={{
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
          {/* Header in sidebar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0 0.5rem' }}>
            <p style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--brand-green)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0,
            }}>
              {roleLabel[activeRole] || 'Portal'}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="mobile-sidebar-close"
              title="Close Menu"
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                borderRadius: 6,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                width: 28,
                height: 28,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {currentItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.href}
                  onClick={handleLinkClick}
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
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
