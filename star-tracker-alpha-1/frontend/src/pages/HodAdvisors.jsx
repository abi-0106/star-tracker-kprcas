import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudentGalleryModal from '../components/StudentGalleryModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Mail, 
  Phone, 
  Award, 
  CheckCircle, 
  Clock, 
  Eye, 
  Search, 
  X, 
  Folder, 
  FileText, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function HodAdvisors() {
  const { user } = useAuth();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inspection State
  const [inspectingAdvisor, setInspectingAdvisor] = useState(null);
  const [advisorDetails, setAdvisorDetails] = useState(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [inspectorTab, setInspectorTab] = useState('students'); // 'students' | 'pending'
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [selectedGalleryStudentId, setSelectedGalleryStudentId] = useState(null);
  const STUDENTS_PER_PAGE = 5;

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const data = await api.getHodAdvisors();
      setAdvisors(data.advisors || []);
    } catch (err) {
      console.error('Failed to fetch advisors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (adv) => {
    setInspectingAdvisor(adv);
    setInspectorTab('students');
    setStudentSearch('');
    setStudentPage(1);
    if (adv.class_id) {
      try {
        setAdvisorLoading(true);
        const data = await api.getAdvisorDashboard(adv.class_id);
        setAdvisorDetails(data);
      } catch (err) {
        console.error('Failed to load advisor details:', err);
      } finally {
        setAdvisorLoading(false);
      }
    } else {
      setAdvisorDetails(null);
    }
  };

  const filteredAdvisors = advisors.filter(a => {
    const q = searchQuery.toLowerCase();
    const name = (a.name || '').toLowerCase();
    const email = (a.email || '').toLowerCase();
    const className = (a.class_name || '').toLowerCase();
    const section = (a.class_section || '').toLowerCase();
    return !q || name.includes(q) || email.includes(q) || className.includes(q) || section.includes(q);
  });

  const inspectedStudents = (advisorDetails?.students || []).filter(s => {
    const q = studentSearch.toLowerCase();
    const name = (s.name || '').toLowerCase();
    const reg = (s.reg_no_emp_id || '').toLowerCase();
    return !q || name.includes(q) || reg.includes(q);
  });

  const totalStudentPages = Math.ceil(inspectedStudents.length / STUDENTS_PER_PAGE) || 1;
  const paginatedStudents = inspectedStudents.slice(
    (studentPage - 1) * STUDENTS_PER_PAGE,
    studentPage * STUDENTS_PER_PAGE
  );

  const inspectedPending = advisorDetails?.pendingCertificates || [];

  const userRole = user?.role || 'hod';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      
      <div style={{ display: 'flex' }}>
        <Sidebar userRole={userRole} role={userRole} />
        
        <main className="portal-main" style={{ flex: 1, padding: '1.75rem 2rem', maxWidth: 1400, width: '100%' }}>
          
          {/* Sticky Top Header & Actions Bar */}
          <div style={{ 
            position: 'sticky', 
            top: 72, 
            zIndex: 35, 
            marginBottom: '1.5rem',
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            padding: '1.25rem 1.5rem',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-mandatory">FACULTY DIRECTORY</span>
                  <span className="badge badge-optional">{advisors.length} Class Advisors</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--brand-blue)' }}>
                  Class Advisors Roster & Workload
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                  Monitor faculty class advisors, inspect section student performance, and track review workloads.
                </p>
              </div>

              {/* Top Bar Actions & Live Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '100%', minWidth: 260, maxWidth: 320 }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search advisor name, class, email..."
                    className="form-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ 
                      height: 38,
                      paddingLeft: '2.4rem', 
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      width: '100%'
                    }}
                  />
                </div>

                <button
                  onClick={fetchAdvisors}
                  className="btn btn-secondary"
                  title="Refresh Advisors"
                  style={{ height: 38, padding: '0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Advisors Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: 'var(--brand-green)' }} />
              <p style={{ fontSize: '0.9rem' }}>Loading Faculty Advisors...</p>
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <Users size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>No Faculty Advisors Found</h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                {searchQuery ? 'No advisors matching your search criteria.' : 'Advisors assigned to your department will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredAdvisors.map((adv) => (
                <div 
                  key={adv.id} 
                  className="glass-card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div>
                    {/* Advisor Header & Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 14, 
                        background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-green))', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 800, 
                        fontSize: '1.15rem',
                        boxShadow: '0 4px 12px rgba(32,142,71,0.2)'
                      }}>
                        {adv.name ? adv.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {adv.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 3 }}>
                          <span className="badge badge-approved" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {adv.class_name ? `${adv.class_name} - ${adv.class_section ? `Sec ${adv.class_section}` : 'Sec A'}` : 'Unassigned Class'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div style={{ 
                      borderTop: '1px solid var(--border-color)', 
                      paddingTop: '0.75rem', 
                      marginBottom: '1rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.35rem', 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={13} style={{ opacity: 0.7, flexShrink: 0, color: 'var(--brand-blue)' }} />
                        <span style={{ wordBreak: 'break-all' }}>{adv.email}</span>
                      </div>
                      {adv.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={13} style={{ opacity: 0.7, flexShrink: 0, color: 'var(--brand-green)' }} />
                          <span>{adv.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Workload Stats Strip */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '0.4rem', 
                      background: 'var(--bg-primary)', 
                      padding: '0.65rem 0.5rem', 
                      borderRadius: 8, 
                      textAlign: 'center', 
                      border: '1px solid var(--border-color)',
                      marginBottom: '0.85rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <Users size={11} /> Students
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-blue)', marginTop: 2 }}>
                          {adv.total_students || 0}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <Clock size={11} color="#D97706" /> Pending
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#D97706', marginTop: 2 }}>
                          {adv.pending_reviews || 0}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <CheckCircle size={11} color="var(--brand-green)" /> Approved
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-green)', marginTop: 2 }}>
                          {adv.approved_count || 0}
                        </div>
                      </div>
                    </div>

                    {/* Inspect Button */}
                    <button
                      onClick={() => handleInspect(adv)}
                      className="btn btn-primary"
                      style={{ 
                        width: '100%', 
                        height: 36, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.45rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Eye size={14} />
                      <span>Inspect Advisor Section</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ============================================================= */}
      {/* ADVISOR INSPECTION MODAL                                      */}
      {/* ============================================================= */}
      {inspectingAdvisor && (
        <div className="modal-overlay" onClick={() => setInspectingAdvisor(null)}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 960, width: '95%', maxHeight: '90vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'linear-gradient(135deg, rgba(43,77,145,0.08), rgba(32,142,71,0.08))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 12, 
                  background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-green))', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: '1.2rem' 
                }}>
                  {inspectingAdvisor.name ? inspectingAdvisor.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-mandatory" style={{ fontSize: '0.68rem' }}>CLASS ADVISOR</span>
                    <span className="badge badge-approved" style={{ fontSize: '0.68rem' }}>
                      {inspectingAdvisor.class_name ? `${inspectingAdvisor.class_name} - ${inspectingAdvisor.class_section || ''}` : 'Unassigned Class'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0', color: 'var(--brand-blue)' }}>
                    {inspectingAdvisor.name}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {inspectingAdvisor.email} {inspectingAdvisor.phone ? `• ${inspectingAdvisor.phone}` : ''}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectingAdvisor(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              
              {/* Summary Metrics Strip */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '0.75rem', 
                marginBottom: '1.25rem' 
              }}>
                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Students</p>
                  <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
                    {advisorDetails?.stats?.totalStudents ?? inspectingAdvisor.total_students ?? 0}
                  </h3>
                </div>

                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Pending Reviews</p>
                  <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>
                    {advisorDetails?.stats?.totalPending ?? inspectingAdvisor.pending_reviews ?? 0}
                  </h3>
                </div>

                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Approved Certs</p>
                  <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-green)' }}>
                    {advisorDetails?.stats?.totalApproved ?? inspectingAdvisor.approved_count ?? 0}
                  </h3>
                </div>

                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Class Avg SP</p>
                  <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#1E3870' }}>
                    {advisorDetails?.stats?.avgSP ?? 0} SP
                  </h3>
                </div>
              </div>

              {/* Inspector Navigation Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => setInspectorTab('students')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: inspectorTab === 'students' ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                    color: inspectorTab === 'students' ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Class Student Roster ({inspectedStudents.length})
                </button>

                <button
                  onClick={() => setInspectorTab('pending')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: inspectorTab === 'pending' ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                    color: inspectorTab === 'pending' ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Pending Submissions Queue ({inspectedPending.length})
                </button>
              </div>

              {/* TAB 1: Student Roster */}
              {inspectorTab === 'students' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                      <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search student by name or reg no..."
                        className="form-input"
                        value={studentSearch}
                        onChange={e => {
                          setStudentSearch(e.target.value);
                          setStudentPage(1);
                        }}
                        style={{ height: 34, paddingLeft: '2.2rem', fontSize: '0.8rem', width: '100%' }}
                      />
                    </div>

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Showing <strong>{inspectedStudents.length > 0 ? (studentPage - 1) * STUDENTS_PER_PAGE + 1 : 0}–{Math.min(studentPage * STUDENTS_PER_PAGE, inspectedStudents.length)}</strong> of <strong>{inspectedStudents.length}</strong> students in section
                    </span>
                  </div>

                  {advisorLoading ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--brand-green)' }} />
                      <p style={{ fontSize: '0.82rem' }}>Loading section students...</p>
                    </div>
                  ) : inspectedStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>No students found in this class section.</p>
                    </div>
                  ) : (
                    <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '0.6rem 0.5rem', width: '6%', textAlign: 'center' }}>Rank</th>
                            <th style={{ padding: '0.6rem 0.75rem', width: '16%' }}>Reg No</th>
                            <th style={{ padding: '0.6rem 0.75rem', width: '26%' }}>Student Name</th>
                            <th style={{ padding: '0.6rem 0.75rem', width: '14%', textAlign: 'center' }}>Total SP</th>
                            <th style={{ padding: '0.6rem 0.75rem', width: '14%', textAlign: 'center' }}>Internal Marks</th>
                            <th style={{ padding: '0.6rem 0.75rem', width: '12%', textAlign: 'center' }}>Mandatory</th>
                            <th style={{ padding: '0.6rem 0.5rem', width: '12%', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStudents.map((s, sIdx) => {
                            const globalRank = (studentPage - 1) * STUDENTS_PER_PAGE + sIdx + 1;
                            return (
                              <tr key={s.id || sIdx} style={{ borderBottom: '1px solid var(--border-color)', background: sIdx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }}>
                                <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>
                                  #{globalRank}
                                </td>
                                <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                                  {s.reg_no_emp_id}
                                </td>
                                <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {s.name}
                                </td>
                                <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--brand-green)' }}>
                                  {s.total_sp} SP
                                </td>
                                <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                                  {s.internal_marks_100} / 100
                                </td>
                                <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                                  {s.mandatory_satisfied ? (
                                    <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>Satisfied</span>
                                  ) : (
                                    <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>Needs SP</span>
                                  )}
                                </td>
                                <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                                  <button
                                    onClick={() => setSelectedGalleryStudentId(s.id)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                    title="Inspect Student Achievements"
                                  >
                                    <Folder size={12} />
                                    <span>Gallery</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Pagination Controls Bar */}
                      {totalStudentPages > 1 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.6rem 0.85rem',
                          borderTop: '1px solid var(--border-color)',
                          background: 'var(--bg-secondary)',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Page <strong>{studentPage}</strong> of <strong>{totalStudentPages}</strong>
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                              disabled={studentPage === 1}
                              className="btn btn-secondary"
                              style={{
                                padding: '0.2rem 0.6rem',
                                fontSize: '0.75rem',
                                opacity: studentPage === 1 ? 0.4 : 1,
                                cursor: studentPage === 1 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Prev
                            </button>

                            {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map(pageNum => (
                              <button
                                key={pageNum}
                                onClick={() => setStudentPage(pageNum)}
                                style={{
                                  minWidth: 26,
                                  height: 26,
                                  padding: '0 0.35rem',
                                  borderRadius: 5,
                                  fontSize: '0.75rem',
                                  fontWeight: studentPage === pageNum ? 700 : 500,
                                  border: studentPage === pageNum ? '1px solid var(--brand-green)' : '1px solid var(--border-color)',
                                  background: studentPage === pageNum ? 'var(--brand-green)' : 'var(--bg-card)',
                                  color: studentPage === pageNum ? '#fff' : 'var(--text-primary)',
                                  cursor: 'pointer'
                                }}
                              >
                                {pageNum}
                              </button>
                            ))}

                            <button
                              onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))}
                              disabled={studentPage === totalStudentPages}
                              className="btn btn-secondary"
                              style={{
                                padding: '0.2rem 0.6rem',
                                fontSize: '0.75rem',
                                opacity: studentPage === totalStudentPages ? 0.4 : 1,
                                cursor: studentPage === totalStudentPages ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Pending Review Queue */}
              {inspectorTab === 'pending' && (
                <div>
                  {advisorLoading ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      <RefreshCw size={22} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--brand-green)' }} />
                      <p style={{ fontSize: '0.82rem' }}>Loading pending reviews...</p>
                    </div>
                  ) : inspectedPending.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <CheckCircle size={36} style={{ color: 'var(--brand-green)', margin: '0 auto 0.5rem', opacity: 0.6 }} />
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>No Pending Submissions</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>This class advisor has cleared all certificate review submissions.</p>
                    </div>
                  ) : (
                    <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '0.6rem 0.75rem', width: '22%' }}>Student</th>
                            <th style={{ padding: '0.6rem 0.75rem', width: '28%' }}>Activity / Event</th>
                            <th style={{ padding: '0.6rem 0.75rem', width: '18%' }}>Level / Desc</th>
                            <th style={{ padding: '0.6rem 0.5rem', width: '12%', textAlign: 'center' }}>Claimed SP</th>
                            <th style={{ padding: '0.6rem 0.5rem', width: '10%', textAlign: 'center' }}>Submitted</th>
                            <th style={{ padding: '0.6rem 0.5rem', width: '10%', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inspectedPending.map((p, pIdx) => (
                            <tr key={p.id || pIdx} style={{ borderBottom: '1px solid var(--border-color)', background: pIdx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)' }}>
                              <td style={{ padding: '0.55rem 0.75rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.student_name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.student_reg_no}</div>
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem' }}>
                                <div style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{p.vertical_code}: {p.vertical_name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.activity_name}</div>
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {p.level_name} {p.level_desc ? `— ${p.level_desc}` : ''}
                              </td>
                              <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                                <span style={{ fontWeight: 800, color: 'var(--brand-green)', background: 'rgba(32,142,71,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                                  +{p.claimed_sp} SP
                                </span>
                              </td>
                              <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '—'}
                              </td>
                              <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                                <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>Pending</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.6rem'
            }}>
              <button
                onClick={() => setInspectingAdvisor(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Achievement Gallery Modal (Drilldown) */}
      {selectedGalleryStudentId && (
        <StudentGalleryModal
          studentId={selectedGalleryStudentId}
          onClose={() => setSelectedGalleryStudentId(null)}
          readOnly={true}
        />
      )}

    </div>
  );
}
