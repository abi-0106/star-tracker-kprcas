import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Award, 
  FileCheck, 
  Users, 
  Building, 
  Settings, 
  ShieldCheck, 
  Trophy, 
  Layers, 
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav({ userRole, role }) {
  const { user } = useAuth();
  const activeRole = userRole || role || user?.role || 'student';

  const navConfigs = {
    student: [
      { label: 'Home',        href: '/student/dashboard',    icon: LayoutDashboard },
      { label: 'Verticals',   href: '/student/verticals',    icon: Layers },
      { label: 'Submit',      href: '/student/submit',       icon: Award, isHighlight: true },
      { label: 'Certs',       href: '/student/certificates', icon: FileCheck },
      { label: 'Rank',        href: '/leaderboard',          icon: Trophy },
    ],
    advisor: [
      { label: 'Home',        href: '/advisor/dashboard',   icon: LayoutDashboard },
      { label: 'Queue',       href: '/advisor/queue',        icon: FileCheck, isHighlight: true },
      { label: 'Students',    href: '/advisor/students',     icon: Users },
      { label: 'Reports',     href: '/hod/reports',          icon: FileText },
      { label: 'Rank',        href: '/leaderboard',          icon: Trophy },
    ],
    hod: [
      { label: 'Home',        href: '/hod/dashboard',        icon: LayoutDashboard },
      { label: 'Advisors',    href: '/hod/advisors',         icon: Users },
      { label: 'Analytics',   href: '/hod/analytics',        icon: Building },
      { label: 'Reports',     href: '/hod/reports',          icon: FileText, isHighlight: true },
      { label: 'Rank',        href: '/leaderboard',          icon: Trophy },
    ],
    dean: [
      { label: 'Home',        href: '/hod/dashboard',        icon: LayoutDashboard },
      { label: 'Advisors',    href: '/hod/advisors',         icon: Users },
      { label: 'Analytics',   href: '/hod/analytics',        icon: Building },
      { label: 'Reports',     href: '/hod/reports',          icon: FileText, isHighlight: true },
      { label: 'Rank',        href: '/leaderboard',          icon: Trophy },
    ],
    principal: [
      { label: 'Home',        href: '/hod/dashboard',        icon: LayoutDashboard },
      { label: 'Advisors',    href: '/hod/advisors',         icon: Users },
      { label: 'Analytics',   href: '/hod/analytics',        icon: Building },
      { label: 'Reports',     href: '/hod/reports',          icon: FileText, isHighlight: true },
      { label: 'Rank',        href: '/leaderboard',          icon: Trophy },
    ],
    admin: [
      { label: 'Home',        href: '/admin/dashboard',      icon: LayoutDashboard },
      { label: 'Rules',       href: '/admin/rules',          icon: Settings },
      { label: 'Users',       href: '/admin/users',          icon: Users },
      { label: 'Reports',     href: '/hod/reports',          icon: FileText },
      { label: 'Audit',       href: '/admin/audit',          icon: ShieldCheck },
    ],
  };

  const items = navConfigs[activeRole] || navConfigs.student;

  return (
    <nav className="liquid-glass-bottom-nav" aria-label="Mobile Bottom Navigation">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={idx}
            to={item.href}
            className={({ isActive }) => `liquid-nav-item ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            {({ isActive }) => (
              <>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon 
                    size={isActive ? 20 : 18} 
                    strokeWidth={isActive ? 2.4 : 1.8}
                    style={{
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), stroke-width 0.2s ease',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)'
                    }}
                  />
                  {item.isHighlight && !isActive && (
                    <span style={{
                      position: 'absolute',
                      top: -2,
                      right: -3,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--brand-green)'
                    }} />
                  )}
                </div>
                <span className="liquid-nav-label">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
