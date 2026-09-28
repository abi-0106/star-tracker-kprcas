import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  FileText, 
  LogOut, 
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MobileBottomNav from './MobileBottomNav';

export default function Sidebar({ userRole, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const activeRole = userRole || role || user?.role || 'student';

  // Listen to toggle events from Navbar or any trigger
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('open-sidebar', handleOpen);
    window.addEventListener('close-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('open-sidebar', handleOpen);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  // Close sidebar automatically when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  // Main navigation categories tailored by role
  const mainNavByRole = {
    student: [
      { label: 'Dashboard',   href: '/student/dashboard',    icon: LayoutDashboard },
      { label: 'Verticals',   href: '/student/verticals',    icon: Layers },
      { label: 'History',     href: '/student/certificates', icon: FileCheck },
      { label: 'Leaderboard', href: '/leaderboard',          icon: Trophy },
    ],
    advisor: [
      { label: 'Dashboard',   href: '/advisor/dashboard',   icon: LayoutDashboard },
      { label: 'Analytics',   href: '/advisor/analytics',    icon: Building },
      { label: 'Leaderboard', href: '/leaderboard',          icon: Trophy },
    ],
    hod: [
      { label: 'Dashboard',   href: '/hod/dashboard',        icon: LayoutDashboard },
      { label: 'Analytics',   href: '/hod/analytics',        icon: Building },
      { label: 'SWOT Analysis', href: '/hod/swot',           icon: ShieldCheck },
      { label: 'Leaderboard', href: '/leaderboard',          icon: Trophy },
    ],
    dean: [
      { label: 'Dashboard',   href: '/dean/dashboard',       icon: LayoutDashboard },
      { label: 'Departments', href: '/dean/departments',     icon: Building },
      { label: 'Verticals',   href: '/dean/verticals',       icon: Layers },
      { label: 'Students',    href: '/dean/students',        icon: Users },
      { label: 'Leaderboard', href: '/dean/leaderboard',     icon: Trophy },
      { label: 'SWOT Analysis', href: '/dean/swot',          icon: ShieldCheck },
    ],
    principal: [
      { label: 'Dashboard',    href: '/principal/dashboard',    icon: LayoutDashboard },
      { label: 'Schools',      href: '/principal/schools',      icon: Building },
      { label: 'Programmes',   href: '/principal/programmes',   icon: Layers },
      { label: 'Students',     href: '/principal/students',     icon: Users },
      { label: 'Achievements', href: '/principal/achievements', icon: Award },
      { label: 'Reports',      href: '/principal/reports',      icon: FileText },
    ],
    admin: [
      { label: 'Dashboard',   href: '/admin/dashboard',      icon: LayoutDashboard },
      { label: 'Audit Logs',  href: '/admin/audit',          icon: ShieldCheck },
    ],
  };

  // Management / Administration navigation items
  const managementNavByRole = {
    student: [
      { label: 'Submit Certificate', href: '/student/submit', icon: Award, highlight: true },
    ],
    advisor: [
      { label: 'Review Queue',  href: '/advisor/queue',    icon: FileCheck, highlight: true },
      { label: 'Student Roster',href: '/advisor/students', icon: Users },
    ],
    hod: [
      { label: 'Advisors Roster', href: '/hod/advisors',   icon: Users },
    ],
    dean: [
      { label: 'Executive Reports', href: '/dean/reports', icon: FileText, highlight: true },
    ],
    principal: [],
    admin: [
      { label: 'Rules & Engine', href: '/admin/rules',     icon: Settings },
      { label: 'Manage Users',   href: '/admin/users',     icon: Users },
    ],
  };

  // 3 Types of Official Reports
  const reportsNavByRole = {
    advisor: [
      { label: 'IQAC Mark Sheets',        href: '/hod/reports?type=consolidated', icon: FileText },
      { label: 'Vertical-Wise Report',    href: '/hod/reports?type=vertical',     icon: Layers },
      { label: 'Student Achievements',    href: '/hod/reports?type=sub_vertical', icon: Award },
    ],
    hod: [
      { label: 'IQAC Mark Sheets',        href: '/hod/reports?type=consolidated', icon: FileText },
      { label: 'Vertical-Wise Report',    href: '/hod/reports?type=vertical',     icon: Layers },
      { label: 'Student Achievements',    href: '/hod/reports?type=sub_vertical', icon: Award, highlight: true },
    ],
    dean: [
      { label: 'Institutional Summary',  href: '/dean/reports?type=institution_summary',   icon: FileText },
      { label: 'Department Comparison',  href: '/dean/reports?type=department_comparison', icon: Building },
      { label: 'Vertical Matrix',        href: '/dean/reports?type=vertical_matrix',       icon: Layers },
      { label: 'Student Roster',         href: '/dean/reports?type=student_roster',        icon: Award },
    ],
    principal: [],
    admin: [
      { label: 'IQAC Mark Sheets',        href: '/hod/reports?type=consolidated', icon: FileText },
      { label: 'Vertical-Wise Report',    href: '/hod/reports?type=vertical',     icon: Layers },
      { label: 'Student Achievements',    href: '/hod/reports?type=sub_vertical', icon: Award },
    ],
  };

  const mainItems = mainNavByRole[activeRole] || mainNavByRole.student;
  const reportItems = reportsNavByRole[activeRole] || [];
  const managementItems = managementNavByRole[activeRole] || managementNavByRole.student;

  const isNavActive = (href) => {
    const [targetPath, targetQuery] = href.split('?');
    if (location.pathname !== targetPath) return false;
    if (!targetQuery) {
      if (targetPath === '/hod/reports') {
        const p = new URLSearchParams(location.search);
        const type = p.get('type');
        return !type || type === 'consolidated' || type === 'iqac';
      }
      return true;
    }
    const params = new URLSearchParams(location.search);
    const targetParams = new URLSearchParams(targetQuery);
    for (const [k, v] of targetParams.entries()) {
      if (params.get(k) !== v) return false;
    }
    return true;
  };

  const roleDisplayTitle = {
    student: 'Student',
    advisor: 'Class Advisor',
    hod:     'Head of Department',
    dean:    'Academic Dean',
    principal: 'Principal',
    admin:   'System Administrator',
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Off-Canvas Drawer Sidebar */}
      <aside 
        className={`sidebar-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => { setIsOpen(false); navigate('/'); }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(32,142,71,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <img src="/kprcas-logo.png" alt="KPRCAS Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                STAR TRACKER
                <span style={{
                  color: '#fff',
                  fontSize: '0.6rem',
                  padding: '1px 5px',
                  background: 'var(--brand-green)',
                  borderRadius: 4,
                  fontWeight: 700,
                }}>ERP</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="sidebar-close-btn"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="sidebar-body">
          {/* Main Navigation */}
          <div>
            <div className="sidebar-section-title">Main Navigation</div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {mainItems.map((item, idx) => {
                const Icon = item.icon;
                const active = isNavActive(item.href);
                return (
                  <NavLink
                    key={idx}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`sidebar-nav-link ${active ? 'active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Reports & Mark Sheets (3 Report Types) */}
          {reportItems.length > 0 && (
            <div>
              <div className="sidebar-section-title">Official Reports</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reportItems.map((item, idx) => {
                  const Icon = item.icon;
                  const active = isNavActive(item.href);
                  return (
                    <NavLink
                      key={idx}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`sidebar-nav-link ${active ? 'active' : ''}`}
                    >
                      <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span style={{
                          marginLeft: 'auto',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--brand-green)',
                        }} />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Management / Administration Section */}
          {managementItems.length > 0 && (
            <div>
              <div className="sidebar-section-title">Management & Tools</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {managementItems.map((item, idx) => {
                  const Icon = item.icon;
                  const active = isNavActive(item.href);
                  return (
                    <NavLink
                      key={idx}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`sidebar-nav-link ${active ? 'active' : ''}`}
                    >
                      <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span style={{
                          marginLeft: 'auto',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--brand-green)',
                        }} />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title="Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Floating Liquid Glass Bottom Navigation on Mobile Viewport */}
      <MobileBottomNav userRole={activeRole} />
    </>
  );
}

