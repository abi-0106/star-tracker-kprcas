import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, GraduationCap, Building2, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('student1@kprcas.ac.in');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { role: 'student',  title: 'Student',        email: 'student1@kprcas.ac.in',  icon: GraduationCap, color: '#208E47' },
    { role: 'advisor',  title: 'Class Advisor',  email: 'advisor@kprcas.ac.in',   icon: UserCheck,     color: '#2B4D91' },
    { role: 'hod',      title: 'HOD',            email: 'hod@kprcas.ac.in',       icon: Building2,     color: '#D97706' },
    { role: 'admin',    title: 'System Admin',   email: 'admin@kprcas.ac.in',     icon: ShieldCheck,   color: '#DC2626' },
  ];

  const handleSelectRole = (acc) => {
    setRole(acc.role);
    setEmail(acc.email);
    setPassword('Password@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password, role);
      const redirectMap = {
        student: '/student/dashboard',
        advisor: '/advisor/dashboard',
        hod:     '/hod/dashboard',
        admin:   '/admin/dashboard',
      };
      navigate(redirectMap[res.user.role] || '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(32,142,71,0.06) 0%, #F4F6F9 50%, rgba(43,77,145,0.06) 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1020,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2.5rem',
        alignItems: 'center',
      }}>
        {/* Left Branding */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.75rem',
            paddingBottom: '1.5rem',
            borderBottom: '2px solid rgba(32,142,71,0.18)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 14,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 16px rgba(32,142,71,0.15)',
              border: '1px solid rgba(32,142,71,0.2)',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              <img
                src="/kprcas-logo.png"
                alt="KPRCAS Logo"
                style={{ width: 68, height: 68, objectFit: 'contain' }}
              />
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0, lineHeight: 1.2 }}>
                KPR College of Arts Science
              </h2>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0, lineHeight: 1.2 }}>
                and Research
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--brand-green)', fontWeight: 600, margin: '4px 0 0 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                LEARN BEYOND
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(32,142,71,0.1)',
              border: '1px solid rgba(32,142,71,0.25)',
              padding: '0.3rem 0.85rem',
              borderRadius: 999,
              color: 'var(--brand-green)',
              fontSize: '0.72rem',
              fontWeight: 700,
              marginBottom: '0.85rem',
              letterSpacing: '0.04em',
            }}>
              ★ OFFICIAL ERP SYSTEM
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em' }}>
              STAR Tracker <span style={{ color: 'var(--brand-green)' }}>ERP</span>
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.6rem', lineHeight: 1.6 }}>
              Comprehensive portal for student holistic achievement verification, vertical point governance, and automatic internal mark conversion.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 0.6rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Demo Account Switcher
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {demoAccounts.map(acc => {
                const Icon = acc.icon;
                const isSelected = role === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectRole(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 8,
                      border: isSelected ? `2px solid ${acc.color}` : '1px solid var(--border-color)',
                      background: isSelected ? `${acc.color}15` : 'var(--bg-primary)',
                      color: isSelected ? acc.color : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.78rem',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <Icon size={16} color={acc.color} />
                    <span>{acc.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Login Box */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: 16 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: '0.25rem' }}>
            Portal Sign In
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enter your credentials or click any demo profile above.
          </p>

          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              color: '#B91C1C',
              padding: '0.65rem 0.85rem',
              borderRadius: 8,
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  required
                  className="form-input"
                  style={{ width: '100%', paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input"
                  style={{ width: '100%', paddingLeft: 38 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Login As Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="student">Student</option>
                <option value="advisor">Class Advisor</option>
                <option value="hod">Head of Department (HOD)</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Star Point Conversion: <strong>2 Star Points = 1 Internal Mark</strong>
          </div>
        </div>
      </div>
    </main>
  );
}
