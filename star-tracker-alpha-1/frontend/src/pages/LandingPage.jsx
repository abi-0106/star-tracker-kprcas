import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const redirectMap = {
          student: '/student/dashboard',
          advisor: '/advisor/dashboard',
          hod: '/hod/dashboard',
          admin: '/admin/dashboard',
        };
        navigate(redirectMap[user.role] || '/student/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ background: 'var(--brand-green)', width: 50, height: 50, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>
          ★
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading STAR Tracker ERP Application...</p>
      </div>
    </div>
  );
}
