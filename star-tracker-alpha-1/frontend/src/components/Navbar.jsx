import React, { useState, useEffect } from 'react';
import { LogOut, Bell, Search, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar({ onThemeToggle, theme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(data => {
          if (data && data.notifications) {
            setNotifications(data.notifications);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'principal': return '#7C3AED';
      case 'dean': return '#4F46E5';
      case 'admin': return '#DC2626';
      case 'hod': return '#D97706';
      case 'advisor': return '#2B4D91';
      case 'student': return '#208E47';
      default: return '#2B4D91';
    }
  };

  return (
    <header className="portal-header" style={{
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      padding: '0 2rem',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
    }}>
      {/* Brand & Mobile Menu Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="sidebar-hamburger-btn"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(32,142,71,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <img src="/kprcas-logo.png" alt="KPRCAS Logo" style={{ width: 38, height: 38, objectFit: 'contain' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--brand-blue)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              STAR TRACKER
              <span style={{
                color: '#fff',
                fontSize: '0.62rem',
                padding: '1px 6px',
                background: 'var(--brand-green)',
                borderRadius: 4,
                letterSpacing: '0.04em',
                fontWeight: 700,
              }}>ERP</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notifications */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              title="Notifications"
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                position: 'relative',
              }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#DC2626',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifPopover && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 45,
                width: 340,
                maxHeight: 400,
                overflowY: 'auto',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                padding: '1rem',
                zIndex: 100,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: '0.75rem', color: 'var(--brand-green)', fontWeight: 600 }}>
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>
                    No notifications yet
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: 8,
                          background: n.is_read ? 'transparent' : 'var(--bg-primary)',
                          borderLeft: n.is_read ? '3px solid transparent' : '3px solid var(--brand-green)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{n.message}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: 4 }}>
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Info / Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: getRoleBadgeColor(user.role),
                  background: `${getRoleBadgeColor(user.role)}18`,
                  padding: '1px 6px',
                  borderRadius: 4,
                }}>
                  {user.role}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.reg_no_emp_id}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                color: '#DC2626',
                borderRadius: 8,
                padding: '0.45rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
