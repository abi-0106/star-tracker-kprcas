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
import HodSwot from './pages/HodSwot';
import HodReports from './pages/HodReports';

// Dean
import DeanDashboard from './pages/DeanDashboard';
import DeanDepartments from './pages/DeanDepartments';
import DeanVerticals from './pages/DeanVerticals';
import DeanStudents from './pages/DeanStudents';
import DeanLeaderboard from './pages/DeanLeaderboard';
import DeanSwot from './pages/DeanSwot';
import DeanReports from './pages/DeanReports';

// Principal
import PrincipalDashboard from './pages/PrincipalDashboard';
import PrincipalSchools from './pages/PrincipalSchools';
import PrincipalProgrammes from './pages/PrincipalProgrammes';
import PrincipalStudents from './pages/PrincipalStudents';
import PrincipalAchievements from './pages/PrincipalAchievements';
import PrincipalReports from './pages/PrincipalReports';

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
    if (user.role === 'dean') return <Navigate to="/dean/dashboard" replace />;
    if (user.role === 'principal') return <Navigate to="/principal/dashboard" replace />;
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

          {/* HOD / Dean / Principal Routes */}
          <Route path="/hod" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal']}>
              <HodDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hod/dashboard" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal']}>
              <HodDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hod/advisors" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal']}>
              <HodAdvisors />
            </ProtectedRoute>
          } />
          <Route path="/hod/analytics" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal']}>
              <HodAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/hod/swot" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal', 'admin']}>
              <HodSwot />
            </ProtectedRoute>
          } />
          <Route path="/hod/reports" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal', 'advisor', 'admin']}>
              <HodReports />
            </ProtectedRoute>
          } />
          <Route path="/advisor/reports" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal', 'advisor', 'admin']}>
              <HodReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal', 'advisor', 'admin']}>
              <HodReports />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['hod', 'dean', 'principal', 'advisor', 'admin']}>
              <HodReports />
            </ProtectedRoute>
          } />

          {/* Dean Routes */}
          <Route path="/dean" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dean/dashboard" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dean/departments" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanDepartments />
            </ProtectedRoute>
          } />
          <Route path="/dean/verticals" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanVerticals />
            </ProtectedRoute>
          } />
          <Route path="/dean/students" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanStudents />
            </ProtectedRoute>
          } />
          <Route path="/dean/leaderboard" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanLeaderboard />
            </ProtectedRoute>
          } />
          <Route path="/dean/swot" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanSwot />
            </ProtectedRoute>
          } />
          <Route path="/dean/reports" element={
            <ProtectedRoute allowedRoles={['dean', 'principal', 'admin']}>
              <DeanReports />
            </ProtectedRoute>
          } />

          {/* Principal Routes */}
          <Route path="/principal" element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <PrincipalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/principal/dashboard" element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <PrincipalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/principal/schools" element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <PrincipalSchools />
            </ProtectedRoute>
          } />
          <Route path="/principal/programmes" element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <PrincipalProgrammes />
            </ProtectedRoute>
          } />
          <Route path="/principal/students" element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <PrincipalStudents />
            </ProtectedRoute>
          } />
          <Route path="/principal/achievements" element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <PrincipalAchievements />
            </ProtectedRoute>
          } />
          <Route path="/principal/reports" element={
            <ProtectedRoute allowedRoles={['principal', 'admin']}>
              <PrincipalReports />
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
