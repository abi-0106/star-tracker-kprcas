import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Student
import StudentDashboard from './pages/StudentDashboard';
import StudentSubmit from './pages/StudentSubmit';
import StudentCertificates from './pages/StudentCertificates';
import StudentVerticals from './pages/StudentVerticals';

// Advisor
import AdvisorDashboard from './pages/AdvisorDashboard';
import AdvisorQueue from './pages/AdvisorQueue';
import AdvisorStudents from './pages/AdvisorStudents';
import AdvisorAnalytics from './pages/AdvisorAnalytics';
import AdvisorStudentGallery from './pages/AdvisorStudentGallery';

// HOD
import HodDashboard from './pages/HodDashboard';
import HodAdvisors from './pages/HodAdvisors';
import HodAnalytics from './pages/HodAnalytics';
import HodReports from './pages/HodReports';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRules from './pages/AdminRules';
import AdminAudit from './pages/AdminAudit';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if role doesn't match
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'advisor') return <Navigate to="/advisor/dashboard" replace />;
    if (user.role === 'hod') return <Navigate to="/hod/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/submit" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentSubmit />
            </ProtectedRoute>
          } />
          <Route path="/student/certificates" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentCertificates />
            </ProtectedRoute>
          } />
          <Route path="/student/verticals" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentVerticals />
            </ProtectedRoute>
          } />

          {/* Advisor Routes */}
          <Route path="/advisor" element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/advisor/dashboard" element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/advisor/queue" element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorQueue />
            </ProtectedRoute>
          } />
          <Route path="/advisor/students" element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorStudents />
            </ProtectedRoute>
          } />
          <Route path="/advisor/analytics" element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/advisor/gallery" element={
            <ProtectedRoute allowedRoles={['advisor']}>
              <AdvisorStudentGallery />
            </ProtectedRoute>
          } />

          {/* HOD Routes */}
          <Route path="/hod" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HodDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hod/dashboard" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HodDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hod/advisors" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HodAdvisors />
            </ProtectedRoute>
          } />
          <Route path="/hod/analytics" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HodAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/hod/reports" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HodReports />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/rules" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRules />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAudit />
            </ProtectedRoute>
          } />

          {/* Leaderboard (Accessible to all authenticated users) */}
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
