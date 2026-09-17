import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudentGalleryModal from '../components/StudentGalleryModal';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export default function AdvisorStudentGallery() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <div style={{ display: 'flex' }}>
        <Sidebar userRole="advisor" />
        <main className="portal-main" style={{ flex: 1, padding: '2rem' }}>
          <StudentGalleryModal
            studentId={studentId}
            onClose={() => navigate('/advisor/students')}
          />
        </main>
      </div>
    </div>
  );
}
