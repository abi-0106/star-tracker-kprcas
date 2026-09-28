import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, UserCheck, Building2, BookOpen, Crown, 
  Lock, Mail, ArrowRight, Loader2, Eye, EyeOff 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Primary portal section: 'student' or 'faculty'
  const [activeSection, setActiveSection] = useState('student');

  // Selected faculty designation within Faculty section
  const [facultyRole, setFacultyRole] = useState('advisor');

  // Form inputs
  const [email, setEmail] = useState('student1@kprcas.ac.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Faculty sub-roles configuration
  const facultyDesignations = [
    {
      id: 'advisor',
      role: 'advisor',
      title: 'Class Advisor',
      email: 'advisor@kprcas.ac.in',
      icon: UserCheck,
      color: '#2B4D91',
    },
    {
      id: 'hod',
      role: 'hod',
      title: 'Head of Dept (HOD)',
      email: 'hod@kprcas.ac.in',
      icon: Building2,
      color: '#D97706',
    },
    {
      id: 'dean',
      role: 'dean',
      title: 'Dean',
      email: 'dean@kprcas.ac.in',
      icon: BookOpen,
      color: '#4F46E5',
    },
    {
      id: 'principal',
      role: 'principal',
      title: 'Principal',
      email: 'principal@kprcas.ac.in',
      icon: Crown,
      color: '#7C3AED',
    },
  ];

  // Handler for switching primary section
  const handleSectionSwitch = (section) => {
    setActiveSection(section);
    setError('');
    if (section === 'student') {
      setEmail('student1@kprcas.ac.in');
      setPassword('password123');
    } else {
      const selected = facultyDesignations.find(f => f.id === facultyRole) || facultyDesignations[0];
      setEmail(selected.email);
      setPassword('password123');
    }
  };

  // Handler for switching faculty designation
  const handleSelectFacultyRole = (fRole) => {
    setFacultyRole(fRole.id);
    setEmail(fRole.email);
    setPassword('password123');
    setError('');
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const targetRole = activeSection === 'student' ? 'student' : facultyRole;

    try {
      const res = await login(email, password, targetRole);
      const userRole = res.user?.role || targetRole;

      const redirectMap = {
        student: '/student/dashboard',
        advisor: '/advisor/dashboard',
        hod: '/hod/dashboard',
        dean: '/dean/dashboard',
        principal: '/principal/dashboard',
        admin: '/admin/dashboard',
      };

      navigate(redirectMap[userRole] || '/student/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const currentFaculty = facultyDesignations.find(f => f.id === facultyRole) || facultyDesignations[0];

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.72)), url("/kprcas-campus-bg.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      padding: '2rem 1rem',
    }}>
      {/* Centered Elevated Login Box */}
      <div style={{
        width: '100%',
        maxWidth: 500,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 24,
        padding: '2.4rem 2.2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.4)',
      }}>
        {/* Header Logo Only */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}>
          <img
            src="/kprcas-logo.png"
            alt="KPR College of Arts Science and Research"
            style={{
              width: '100%',
              maxWidth: 340,
              height: 'auto',
              maxHeight: 85,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Section Switcher: ONLY Student & Faculty */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(0, 0, 0, 0.04)',
          padding: '4px',
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          marginBottom: '1.25rem',
          gap: '4px',
        }}>
          <button
            type="button"
            onClick={() => handleSectionSwitch('student')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1rem',
              borderRadius: 9,
              fontWeight: activeSection === 'student' ? 800 : 600,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              background: activeSection === 'student' ? '#208E47' : 'transparent',
              color: activeSection === 'student' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeSection === 'student' ? '0 2px 10px rgba(32,142,71,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <GraduationCap size={18} />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleSectionSwitch('faculty')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1rem',
              borderRadius: 9,
              fontWeight: activeSection === 'faculty' ? 800 : 600,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              background: activeSection === 'faculty' ? '#2B4D91' : 'transparent',
              color: activeSection === 'faculty' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeSection === 'faculty' ? '0 2px 10px rgba(43,77,145,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <UserCheck size={18} />
            <span>Faculty</span>
          </button>
        </div>

        {/* If Faculty Section, show Designation Selector Grid */}
        {activeSection === 'faculty' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Faculty Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
              {facultyDesignations.map(f => {
                const Icon = f.icon;
                const isSelected = facultyRole === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFacultyRole(f)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 0.65rem',
                      borderRadius: 9,
                      border: isSelected ? `2px solid ${f.color}` : '1px solid rgba(0,0,0,0.08)',
                      background: isSelected ? `${f.color}15` : '#fff',
                      color: isSelected ? f.color : 'var(--text-primary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: isSelected ? f.color : 'rgba(0,0,0,0.06)',
                      color: isSelected ? '#fff' : f.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={14} />
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: '#B91C1C',
            padding: '0.65rem 0.85rem',
            borderRadius: 10,
            fontSize: '0.82rem',
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={activeSection === 'student' ? 'student1@kprcas.ac.in' : 'faculty@kprcas.ac.in'}
                required
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: 42,
                  paddingRight: 14,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 10,
                  background: '#fff',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.35rem' }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input"
                style={{
                  width: '100%',
                  paddingLeft: 42,
                  paddingRight: 42,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 10,
                  background: '#fff',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'transparent',
                  border: 'none',
                  color: showPassword ? 'var(--brand-green)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  transition: 'color 0.15s ease',
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 10,
              fontSize: '0.92rem',
              fontWeight: 700,
              background: activeSection === 'student' ? 'var(--brand-green)' : 'var(--brand-blue)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: activeSection === 'student' ? '0 4px 14px rgba(32,142,71,0.35)' : '0 4px 14px rgba(43,77,145,0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>
                  Sign In as {activeSection === 'student' ? 'Student' : currentFaculty.title}
                </span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
