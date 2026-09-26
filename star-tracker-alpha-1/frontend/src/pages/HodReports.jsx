import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Award, 
  Users, 
  CheckCircle, 
  RefreshCw, 
  Star, 
  Layers, 
  ListFilter, 
  ExternalLink, 
  Eye, 
  X, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function HodReports() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get('type');
  
  // 3 Types of Reports matched via Sidebar & URL Query:
  // 1. 'consolidated' or 'iqac'        - IQAC Class Report (General Format - PDF 2)
  // 2. 'vertical'                     - Vertical Report (Summary & Sub-Vertical Breakdown)
  // 3. 'sub_vertical' or 'achievement'- Student Achievement Tracker / Database (PDF 1)
  const reportType = useMemo(() => {
    if (urlType === 'vertical') return 'vertical';
    if (urlType === 'sub_vertical' || urlType === 'achievement') return 'sub_vertical';
    return 'consolidated'; // default to IQAC format
  }, [urlType]);

  // Master & Raw Data
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Filter States
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedVertical, setSelectedVertical] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [collapsedVerticals, setCollapsedVerticals] = useState({});

  // Proof Preview Modal State
  const [previewProof, setPreviewProof] = useState(null);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studRes, clsRes, vertRes, subRes] = await Promise.all([
        api.getHodStudents().catch(() => ({ students: [] })),
        api.getClasses().catch(() => []),
        api.getVerticals().catch(() => ({ verticals: [] })),
        api.getDetailedSubmissions().catch(() => ({ submissions: [] })),
      ]);

      const rawStudents = studRes?.students || (Array.isArray(studRes) ? studRes : []);
      setStudents(rawStudents);
      setClasses(Array.isArray(clsRes) ? clsRes : (clsRes?.classes || []));
      
      const rawVerts = vertRes?.verticals || (Array.isArray(vertRes) ? vertRes : []);
      setVerticals(rawVerts);
      
      const rawSubs = subRes?.submissions || (Array.isArray(subRes) ? subRes : []);
      setSubmissions(rawSubs);
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get available sub-verticals (activities) based on selected vertical
  const availableActivities = useMemo(() => {
    if (selectedVertical === 'all') {
      return verticals.flatMap(v => v.activities || []);
    }
    const found = verticals.find(v => String(v.id) === String(selectedVertical));
    return found?.activities || [];
  }, [selectedVertical, verticals]);

  // Reset selected activity if vertical changes and selected activity is not part of it
  useEffect(() => {
    if (selectedActivity !== 'all') {
      const exists = availableActivities.some(a => String(a.id) === String(selectedActivity));
      if (!exists) {
        setSelectedActivity('all');
      }
    }
  }, [selectedVertical, availableActivities, selectedActivity]);

  // -------------------------------------------------------------
  // REPORT 1: CONSOLIDATED / IQAC FILTERING & METRICS (PDF 2)
  // -------------------------------------------------------------
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const studentName = (s.name || '').toLowerCase();
      const rollNo = (s.roll_no || s.reg_no_emp_id || '').toLowerCase();
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || studentName.includes(q) || rollNo.includes(q);
      const matchesClass = selectedClass === 'all' || String(s.class_id) === String(selectedClass);
      return matchesSearch && matchesClass;
    });
  }, [students, search, selectedClass]);

  // Submissions filtered for IQAC format table
  const iqacSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (selectedClass !== 'all' && String(sub.class_id) !== String(selectedClass)) return false;
      if (selectedVertical !== 'all' && String(sub.vertical_id) !== String(selectedVertical)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const sName = (sub.student_name || '').toLowerCase();
        const rNo = (sub.roll_no || sub.reg_no_emp_id || '').toLowerCase();
        const actName = (sub.activity_name || '').toLowerCase();
        if (!sName.includes(q) && !rNo.includes(q) && !actName.includes(q)) return false;
      }
      return true;
    });
  }, [submissions, selectedClass, selectedVertical, search]);

  // -------------------------------------------------------------
  // REPORT 2: VERTICAL SUMMARY & BREAKDOWN METRICS
  // -------------------------------------------------------------
  const verticalMetrics = useMemo(() => {
    const classFilteredSubs = submissions.filter(s => {
      if (selectedClass === 'all') return true;
      return String(s.class_id) === String(selectedClass);
    });

    const totalEnrolled = filteredStudents.length || students.length || 1;

    let totalAllSP = 0;
    let totalAllSubmissions = 0;
    let allParticipatingStudentIds = new Set();
    let totalSubVerticalsCount = 0;

    const list = verticals.map(v => {
      const vSubs = classFilteredSubs.filter(s => s.vertical_id === v.id);
      const approvedSubs = vSubs.filter(s => s.status === 'approved');
      const studentIds = new Set(approvedSubs.map(s => s.student_id));
      const totalSP = approvedSubs.reduce((acc, s) => acc + Number(s.claimed_sp || 0), 0);
      const totalMarks = (totalSP / 2.0).toFixed(1);
      const partCount = studentIds.size;
      const partPct = totalEnrolled > 0 ? ((partCount / totalEnrolled) * 100).toFixed(1) : '0';

      totalAllSP += totalSP;
      totalAllSubmissions += vSubs.length;
      approvedSubs.forEach(s => allParticipatingStudentIds.add(s.student_id));

      const subBreakdown = (v.activities || []).filter(act => {
        if (selectedActivity !== 'all' && String(act.id) !== String(selectedActivity)) return false;
        return true;
      }).map(act => {
        totalSubVerticalsCount++;
        const actSubs = vSubs.filter(s => s.activity_id === act.id);
        const actApproved = actSubs.filter(s => s.status === 'approved');
        const actStudentIds = new Set(actApproved.map(s => s.student_id));
        const actSP = actApproved.reduce((acc, s) => acc + Number(s.claimed_sp || 0), 0);
        const actMarks = (actSP / 2.0).toFixed(1);
        const actPartPct = totalEnrolled > 0 ? ((actStudentIds.size / totalEnrolled) * 100).toFixed(1) : '0';

        return {
          activityId: act.id,
          activityNo: act.activity_no,
          activityName: act.name,
          submissionsCount: actSubs.length,
          approvedCount: actApproved.length,
          participatedCount: actStudentIds.size,
          totalSP: actSP,
          totalMarks: actMarks,
          participationPct: actPartPct,
        };
      });

      return {
        verticalId: v.id,
        verticalCode: v.code,
        verticalName: v.name,
        type: v.type,
        minSP: v.min_sp,
        maxSP: v.max_sp,
        totalSubmissions: vSubs.length,
        approvedSubmissions: approvedSubs.length,
        participatingStudents: partCount,
        totalSP,
        totalMarks,
        participationPct: partPct,
        activities: subBreakdown,
      };
    });

    const activeVertical = selectedVertical === 'all' 
      ? null 
      : list.find(v => String(v.verticalId) === String(selectedVertical));

    const totalAllMarks = (totalAllSP / 2.0).toFixed(1);
    const overallParticipationPct = totalEnrolled > 0 ? ((allParticipatingStudentIds.size / totalEnrolled) * 100).toFixed(1) : '0';

    return { 
      list, 
      activeVertical, 
      totalEnrolled,
      totalAllSP,
      totalAllMarks,
      totalAllSubmissions,
      allParticipatingStudents: allParticipatingStudentIds.size,
      overallParticipationPct,
      totalSubVerticalsCount
    };
  }, [verticals, submissions, selectedClass, filteredStudents.length, students.length, selectedVertical, selectedActivity]);

  // -------------------------------------------------------------
  // REPORT 3: STUDENT ACHIEVEMENT DATABASE GROUPING (PDF 1)
  // -------------------------------------------------------------
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (selectedClass !== 'all' && String(sub.class_id) !== String(selectedClass)) return false;
      if (selectedVertical !== 'all' && String(sub.vertical_id) !== String(selectedVertical)) return false;
      if (selectedActivity !== 'all' && String(sub.activity_id) !== String(selectedActivity)) return false;
      if (selectedStatus !== 'all' && sub.status !== selectedStatus) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const sName = (sub.student_name || '').toLowerCase();
        const rNo = (sub.roll_no || sub.reg_no_emp_id || '').toLowerCase();
        const actName = (sub.activity_name || '').toLowerCase();
        const lvlName = (sub.level_name || '').toLowerCase();
        const remarks = (sub.student_remarks || '').toLowerCase();
        if (!sName.includes(q) && !rNo.includes(q) && !actName.includes(q) && !lvlName.includes(q) && !remarks.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, selectedClass, selectedVertical, selectedActivity, selectedStatus, search]);

  // Group achievements by Vertical Category (matching PDF 1 format)
  const groupedCategoryAchievements = useMemo(() => {
    const groups = {};
    filteredSubmissions.forEach(sub => {
      const catKey = sub.vertical_name || sub.vertical_code || 'General Achievements';
      if (!groups[catKey]) {
        groups[catKey] = {
          categoryName: catKey,
          verticalCode: sub.vertical_code,
          records: []
        };
      }
      groups[catKey].records.push(sub);
    });
    return Object.values(groups);
  }, [filteredSubmissions]);

  // Summary counts for PDF 1 Header
  const achievementSummary = useMemo(() => {
    const partStudents = new Set(filteredSubmissions.map(s => s.student_id)).size;
    const approvedCount = filteredSubmissions.filter(s => s.status === 'approved').length;
    const activeCats = groupedCategoryAchievements.length;
    const totalSP = filteredSubmissions.reduce((acc, s) => acc + (s.status === 'approved' ? Number(s.claimed_sp || 0) : 0), 0);

    return {
      participatingStudents: partStudents,
      approvedRecords: approvedCount,
      activeCategories: activeCats,
      totalSP
    };
  }, [filteredSubmissions, groupedCategoryAchievements]);

  // -------------------------------------------------------------
  // EXPORT CONFIGURATION (Matching exact formats)
  // -------------------------------------------------------------
  const exportPayload = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const classNameText = selectedClass !== 'all' 
      ? classes.find(c => String(c.id) === String(selectedClass))?.name || 'Selected Class'
      : 'All Classes';

    if (reportType === 'consolidated') {
      const data = iqacSubmissions.map((sub, idx) => {
        const fullClass = sub.class_name ? sub.class_name : 'B.Com IT - I Year';
        const section = sub.class_section ? `Sec ${sub.class_section}` : 'Sec A';
        const dateStr = sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-GB') : '—';
        return {
          'S.NO': idx + 1,
          'STUDENT NAME & REG NO': `${sub.student_name}\n${sub.roll_no || sub.reg_no_emp_id || ''}`,
          'ACADEMIC YEAR': sub.batch_year || '2025-2026',
          'CLASS': fullClass,
          'SECTION': section,
          'VERTICAL & SUB-PARAM': `${sub.vertical_code || ''} — ${sub.activity_name || ''}`,
          'EVENT / PROFILE DETAILS': sub.level_name ? `${sub.level_name}${sub.level_desc ? ` — ${sub.level_desc}` : ''}` : (sub.student_remarks || 'Participant'),
          'DATE': dateStr,
          'ORGANISED BY': sub.reviewer_name ? `KPRCAS / ${sub.department_name || 'Dept of Commerce'}` : 'NPTEL / Swayam / Industry Board',
          'RESULT / STATUS': sub.status ? sub.status.toUpperCase() : 'APPROVED',
        };
      });

      const columns = [
        { header: 'S.NO', dataKey: 'S.NO' },
        { header: 'STUDENT NAME & REG NO', dataKey: 'STUDENT NAME & REG NO' },
        { header: 'ACADEMIC YEAR', dataKey: 'ACADEMIC YEAR' },
        { header: 'CLASS', dataKey: 'CLASS' },
        { header: 'SECTION', dataKey: 'SECTION' },
        { header: 'VERTICAL & SUB-PARAM', dataKey: 'VERTICAL & SUB-PARAM' },
        { header: 'EVENT / PROFILE DETAILS', dataKey: 'EVENT / PROFILE DETAILS' },
        { header: 'DATE', dataKey: 'DATE' },
        { header: 'ORGANISED BY', dataKey: 'ORGANISED BY' },
        { header: 'RESULT / STATUS', dataKey: 'RESULT / STATUS' },
      ];

      return {
        data,
        columns,
        filename: `IQAC_Class_Report_${today}`,
        title: `KPR COLLEGE OF ARTS SCIENCE AND RESEARCH — IQAC CLASS REPORT (${classNameText})`,
      };
    }

    if (reportType === 'vertical') {
      const activeVert = verticalMetrics.activeVertical;
      if (activeVert) {
        const data = activeVert.activities.map((act, idx) => ({
          'S.No': idx + 1,
          'Vertical': `${activeVert.verticalCode} — ${activeVert.verticalName}`,
          'Sub-Vertical / Activity': act.activityName,
          'Total Submissions': act.submissionsCount,
          'Students Participated': act.participatedCount,
          'Approved Star Points': `${act.totalSP} SP`,
          'Converted Marks': `${act.totalMarks} Marks`,
          'Participation Rate': `${act.participationPct}%`,
        }));

        const columns = [
          { header: 'S.No', dataKey: 'S.No' },
          { header: 'Vertical', dataKey: 'Vertical' },
          { header: 'Sub-Vertical / Activity', dataKey: 'Sub-Vertical / Activity' },
          { header: 'Total Submissions', dataKey: 'Total Submissions' },
          { header: 'Students Participated', dataKey: 'Students Participated' },
          { header: 'Approved SP', dataKey: 'Approved Star Points' },
          { header: 'Converted Marks', dataKey: 'Converted Marks' },
          { header: 'Participation %', dataKey: 'Participation Rate' },
        ];

        return {
          data,
          columns,
          filename: `Vertical_Report_${activeVert.verticalCode}_${today}`,
          title: `VERTICAL REPORT: ${activeVert.verticalCode} — ${activeVert.verticalName} (${classNameText})`,
        };
      } else {
        const data = [];
        let sNo = 1;
        verticalMetrics.list.forEach((v) => {
          (v.activities || []).forEach((act) => {
            data.push({
              'S.No': sNo++,
              'Vertical Code': v.verticalCode,
              'Vertical Name': v.verticalName,
              'Type': v.type,
              'Sub-Vertical / Activity': act.activityName,
              'Total Submissions': act.submissionsCount,
              'Students Participated': act.participatedCount,
              'Approved SP': `${act.totalSP} SP`,
              'Converted Marks': `${act.totalMarks} Marks`,
              'Participation %': `${act.participationPct}%`,
            });
          });
        });

        const columns = [
          { header: 'S.No', dataKey: 'S.No' },
          { header: 'Code', dataKey: 'Vertical Code' },
          { header: 'Vertical Name', dataKey: 'Vertical Name' },
          { header: 'Type', dataKey: 'Type' },
          { header: 'Sub-Vertical / Activity', dataKey: 'Sub-Vertical / Activity' },
          { header: 'Submissions', dataKey: 'Total Submissions' },
          { header: 'Participated', dataKey: 'Students Participated' },
          { header: 'Approved SP', dataKey: 'Approved SP' },
          { header: 'Marks', dataKey: 'Converted Marks' },
          { header: 'Participation %', dataKey: 'Participation %' },
        ];

        return {
          data,
          columns,
          filename: `Vertical_Wise_Sub_Vertical_Report_${today}`,
          title: `STAR TRACKER — Vertical & Sub-Vertical Performance Report (${classNameText})`,
        };
      }
    }

    if (reportType === 'sub_vertical') {
      const data = filteredSubmissions.map((sub, idx) => {
        const fullClass = sub.class_name ? `${sub.class_name} - I Year — ${sub.class_section ? `Sec ${sub.class_section}` : 'Sec A'}` : 'B.Com IT - I Year — Sec A';
        const dateStr = sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-GB') : '—';
        const eventName = sub.level_name ? `${sub.activity_name} — ${sub.level_name}` : sub.activity_name;
        const prize = sub.level_desc || sub.level_name || (sub.status === 'approved' ? 'Completed / Winner' : sub.status);
        const orgBy = sub.reviewer_name ? `KPRCAS / ${sub.department_name || 'Dept of Commerce'}` : 'NPTEL / Swayam / Industry Board';

        return {
          'S.No': idx + 1,
          'Student Name': sub.student_name,
          'Class': fullClass,
          'Academic Year': sub.batch_year || '2025-2026',
          'Event Name': eventName,
          'Date': dateStr,
          'Organised By': orgBy,
          'Prize': prize,
        };
      });

      const columns = [
        { header: 'S.No', dataKey: 'S.No' },
        { header: 'Student Name', dataKey: 'Student Name' },
        { header: 'Class', dataKey: 'Class' },
        { header: 'Academic Year', dataKey: 'Academic Year' },
        { header: 'Event Name', dataKey: 'Event Name' },
        { header: 'Date', dataKey: 'Date' },
        { header: 'Organised By', dataKey: 'Organised By' },
        { header: 'Prize', dataKey: 'Prize' },
      ];

      return {
        data,
        columns,
        filename: `Student_Achievement_Tracker_Database_${today}`,
        title: `B.Com (IT) - DATABASE | STUDENT ACHIEVEMENT TRACKER (${classNameText})`,
      };
    }

    return { data: [], columns: [], filename: 'report', title: 'Report' };
  }, [reportType, iqacSubmissions, verticalMetrics, filteredSubmissions, selectedClass, classes]);

  const userRole = user?.role || 'hod';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole={userRole} role={userRole} />
        
        {/* Main Content Container */}
        <main className="portal-main" style={{ 
          flex: 1, 
          padding: '1.75rem 2rem', 
          maxWidth: 1380, 
          margin: '0 auto', 
          width: '100%' 
        }}>
          
          {/* Top Actions & Filters Bar */}
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              
              {/* Search Box */}
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <Search 
                  size={15} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.85rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }} 
                />
                <input 
                  type="text" 
                  placeholder="Search student name, roll number, activity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-input"
                  style={{ 
                    height: 38,
                    paddingLeft: '2.4rem', 
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    width: '100%'
                  }}
                />
              </div>

              {/* Filters Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                
                {/* 1. Class Dropdown Filter */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Filter size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="form-select"
                    style={{ 
                      height: 38,
                      paddingLeft: '2.1rem',
                      paddingRight: '1.8rem',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      width: 'auto',
                      minWidth: 170,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Classes & Sections</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.section ? `- Sec ${c.section}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Vertical Dropdown */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Layers size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select 
                    value={selectedVertical} 
                    onChange={(e) => setSelectedVertical(e.target.value)}
                    className="form-select"
                    style={{ 
                      height: 38,
                      paddingLeft: '2.1rem',
                      paddingRight: '1.8rem',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      width: 'auto',
                      minWidth: 190,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Verticals (V1 - V10)</option>
                    {verticals.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.code}: {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Sub-Vertical / Activity Dropdown */}
                {(reportType === 'sub_vertical' || reportType === 'vertical') && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <ListFilter size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <select 
                      value={selectedActivity} 
                      onChange={(e) => setSelectedActivity(e.target.value)}
                      className="form-select"
                      style={{ 
                        height: 38,
                        paddingLeft: '2.1rem',
                        paddingRight: '1.8rem',
                        fontSize: '0.82rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        width: 'auto',
                        minWidth: 190,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Sub-Verticals</option>
                      {availableActivities.map(act => (
                        <option key={act.id} value={act.id}>
                          {act.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Refresh Live Button */}
                <button 
                  onClick={fetchData} 
                  className="btn btn-secondary" 
                  title="Refresh Live Data"
                  style={{ 
                    height: 38,
                    padding: '0 0.85rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                
                {/* Export Report */}
                <ExportButton 
                  buttonText="Export Report"
                  label="Export Report"
                  data={exportPayload.data} 
                  filename={exportPayload.filename}
                  title={exportPayload.title}
                  columns={exportPayload.columns}
                />

              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* FORMAT 1: IQAC CLASS REPORT / GENERAL FORMAT (PDF 2)          */}
          {/* ============================================================= */}
          {reportType === 'consolidated' && (
            <div className="data-table-card" style={{ padding: '1.5rem', background: '#fff', color: '#000', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              
              {/* PDF 2 Official IQAC Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #208E47', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 52, height: 52, border: '1px solid #cbd5e1', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/kprcas-logo.png" alt="KPRCAS Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                      KPR COLLEGE OF ARTS SCIENCE AND RESEARCH
                    </h2>
                    <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                      (Affiliated to Bharathiar University)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Avinashi Road, Arasur, Coimbatore - 641407, Tamil Nadu
                    </div>
                  </div>
                </div>

                {/* Right Meta Box */}
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#334155', lineHeight: 1.5 }}>
                  <div><strong>Date of Generation:</strong> {new Date().toLocaleDateString('en-GB')}</div>
                  <div><strong>Ref:</strong> KPRCAS/ADV-COM-IT/IQAC/2026</div>
                  <div style={{ fontWeight: 700, color: '#1E3870' }}>FORMAT: IQAC CLASS REPORT (GENERAL_FORMAT)</div>
                </div>
              </div>

              {/* Sub-header Title & Filter Summary Pill */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>
                    CLASS ADVISOR SECTION REPORT &bull; {selectedClass !== 'all' ? (classes.find(c => String(c.id) === String(selectedClass))?.name || 'B.COM(IT)') : 'B.COM(IT) - ALL SECTIONS'}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    OFFICIAL IQAC STUDENT ACTIVITY REPORT
                  </div>
                </div>

                {/* Filter Summary Box */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.75rem',
                  color: '#334155',
                  lineHeight: 1.4
                }}>
                  Vertical: <strong>{selectedVertical === 'all' ? 'ALL' : verticals.find(v => String(v.id) === String(selectedVertical))?.name}</strong> &bull; Sub-Param: <strong>All</strong> &bull; Academic Year: <strong>2025–2026 (Semester 2)</strong> &bull; Dept / Section: <strong>{selectedClass !== 'all' ? classes.find(c => String(c.id) === String(selectedClass))?.name : 'B.COM(IT) - Class Advisor - 1st Year (Sec A)'}</strong>
                </div>
              </div>

              {/* IQAC Data Table */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#208E47' }} />
                  <p style={{ fontSize: '0.85rem' }}>Loading IQAC Class Report...</p>
                </div>
              ) : iqacSubmissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: 8, margin: '1rem 0' }}>
                  <p style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                    ⚠️ No student certificate records found matching the selected filters for your section.
                  </p>
                </div>
              ) : (
                <div className="table-container" style={{ border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#0f172a', fontWeight: 800 }}>
                        <th style={{ padding: '0.6rem 0.5rem', width: '5%', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>S.NO</th>
                        <th style={{ padding: '0.6rem 0.65rem', width: '15%', borderRight: '1px solid #cbd5e1' }}>STUDENT NAME & REG NO</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '9%', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>ACADEMIC YEAR</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '10%', borderRight: '1px solid #cbd5e1' }}>CLASS</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '7%', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>SECTION</th>
                        <th style={{ padding: '0.6rem 0.65rem', width: '18%', borderRight: '1px solid #cbd5e1' }}>VERTICAL & SUB-PARAM</th>
                        <th style={{ padding: '0.6rem 0.65rem', width: '16%', borderRight: '1px solid #cbd5e1' }}>EVENT / PROFILE DETAILS</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '8%', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>DATE</th>
                        <th style={{ padding: '0.6rem 0.65rem', width: '12%', borderRight: '1px solid #cbd5e1' }}>ORGANISED BY</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '8%', textAlign: 'center' }}>RESULT / STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {iqacSubmissions.map((sub, idx) => {
                        const fullClass = sub.class_name ? sub.class_name : 'B.Com IT';
                        const section = sub.class_section ? `Sec ${sub.class_section}` : 'Sec A';
                        const dateStr = sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-GB') : '—';
                        const orgBy = sub.reviewer_name ? `KPRCAS / ${sub.department_name || 'Dept of Commerce'}` : 'NPTEL / Swayam / Industry Board';

                        return (
                          <tr key={sub.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>{idx + 1}</td>
                            <td style={{ padding: '0.55rem 0.65rem', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                              <div>{sub.student_name}</div>
                              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{sub.roll_no || sub.reg_no_emp_id}</div>
                            </td>
                            <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', color: '#475569', borderRight: '1px solid #e2e8f0' }}>{sub.batch_year || '2025-2026'}</td>
                            <td style={{ padding: '0.55rem 0.5rem', color: '#334155', borderRight: '1px solid #e2e8f0' }}>{fullClass}</td>
                            <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', color: '#475569', borderRight: '1px solid #e2e8f0' }}>{section}</td>
                            <td style={{ padding: '0.55rem 0.65rem', borderRight: '1px solid #e2e8f0' }}>
                              <div style={{ fontWeight: 700, color: '#208E47' }}>{sub.vertical_code}</div>
                              <div style={{ color: '#334155', fontSize: '0.72rem' }}>{sub.activity_name}</div>
                            </td>
                            <td style={{ padding: '0.55rem 0.65rem', color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                              {sub.level_name ? `${sub.level_name}${sub.level_desc ? ` — ${sub.level_desc}` : ''}` : (sub.student_remarks || 'Participant')}
                            </td>
                            <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', color: '#475569', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{dateStr}</td>
                            <td style={{ padding: '0.55rem 0.65rem', color: '#475569', fontSize: '0.7rem', borderRight: '1px solid #e2e8f0' }}>{orgBy}</td>
                            <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center' }}>
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: sub.status === 'approved' ? '#dcfce7' : '#fef3c7',
                                color: sub.status === 'approved' ? '#166534' : '#92400e',
                                border: `1px solid ${sub.status === 'approved' ? '#86efac' : '#fde68a'}`
                              }}>
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Signatures for PDF 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3.5rem', paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 180, borderBottom: '1px solid #94a3b8', marginBottom: '0.4rem' }} />
                  <div>CLASS ADVISOR</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 180, borderBottom: '1px solid #94a3b8', marginBottom: '0.4rem' }} />
                  <div>HEAD OF THE DEPARTMENT</div>
                </div>
              </div>

              {/* Official Academic Footer */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8' }}>
                STAR TRACKER ERP &bull; KPR College of Arts Science and Research &bull; Official Academic Record Database
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* FORMAT 2: STUDENT ACHIEVEMENT TRACKER / DATABASE (PDF 1)      */}
          {/* ============================================================= */}
          {reportType === 'sub_vertical' && (
            <div className="data-table-card" style={{ padding: '1.5rem', background: '#fff', color: '#000', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              
              {/* PDF 1 Official Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '2px solid #208E47', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ width: 52, height: 52, border: '1px solid #cbd5e1', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/kprcas-logo.png" alt="KPRCAS Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    KPR College of Arts Science and Research
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    Affiliated to Bharathiar University, Recognized by UGC under Section 2(f)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Avinashi Road, Arasur, Coimbatore – 641 407
                  </div>
                </div>
              </div>

              {/* Title & Metadata Strip */}
              <div style={{ marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3870', margin: '0 0 0.2rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  B.Com (IT) - DATABASE | STUDENT ACHIEVEMENT TRACKER
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Department: <strong>B.Com IT</strong> &bull; Academic Year: <strong>2025-2026</strong> &bull; Generated: <strong>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> &bull; Report ID: <strong>KPR-SAR-20252026-6402</strong>
                </div>
              </div>

              {/* Summary Strip (PDF 1) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '0.45rem 0.85rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '1.25rem'
              }}>
                Summary: {achievementSummary.participatingStudents} Participating Students &bull; {achievementSummary.approvedRecords} Approved Records &bull; {achievementSummary.activeCategories} Active Categories &bull; {achievementSummary.totalSP} Total Star Points Earned
              </div>

              {/* Category Grouped Tables (PDF 1) */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#208E47' }} />
                  <p style={{ fontSize: '0.85rem' }}>Loading Student Achievement Database...</p>
                </div>
              ) : groupedCategoryAchievements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: 8, margin: '1rem 0' }}>
                  <p style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                    ⚠️ No student achievement records found matching the specified filters.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {groupedCategoryAchievements.map((group, gIdx) => (
                    <div key={gIdx} style={{ border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}>
                      
                      {/* Dark Blue Category Banner (PDF 1) */}
                      <div style={{
                        background: '#1E3870',
                        color: '#fff',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase'
                      }}>
                        B.Com (IT) - DATABASE — {group.categoryName} ({group.records.length} Records)
                      </div>

                      {/* Green Table Header & Data Rows (PDF 1) */}
                      <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#208E47', color: '#ffffff', fontWeight: 700 }}>
                              <th style={{ padding: '0.55rem 0.5rem', width: '5%', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>S.No</th>
                              <th style={{ padding: '0.55rem 0.75rem', width: '16%', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Student Name</th>
                              <th style={{ padding: '0.55rem 0.65rem', width: '15%', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Class</th>
                              <th style={{ padding: '0.55rem 0.5rem', width: '10%', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Academic Year</th>
                              <th style={{ padding: '0.55rem 0.75rem', width: '24%', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Event Name</th>
                              <th style={{ padding: '0.55rem 0.5rem', width: '9%', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Date</th>
                              <th style={{ padding: '0.55rem 0.75rem', width: '13%', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Organised By</th>
                              <th style={{ padding: '0.55rem 0.65rem', width: '8%', textAlign: 'center' }}>Prize / Proof</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.records.map((rec, rIdx) => {
                              const fullClass = rec.class_name ? `${rec.class_name} - I Year — ${rec.class_section ? `Sec ${rec.class_section}` : 'Sec A'}` : 'B.Com IT - I Year — Sec A';
                              const dateStr = rec.submitted_at ? new Date(rec.submitted_at).toLocaleDateString('en-GB') : '—';
                              const eventName = rec.level_name ? `${rec.activity_name} — ${rec.level_name}` : rec.activity_name;
                              const prize = rec.level_desc || rec.level_name || (rec.status === 'approved' ? 'Completed' : rec.status);
                              const orgBy = rec.reviewer_name ? `KPRCAS / ${rec.department_name || 'Dept of Commerce'}` : 'NPTEL / Swayam / Industry Board';

                              return (
                                <tr key={rec.id || rIdx} style={{ borderBottom: '1px solid #e2e8f0', background: rIdx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                  <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>{rIdx + 1}</td>
                                  <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                                    <div>{rec.student_name}</div>
                                  </td>
                                  <td style={{ padding: '0.55rem 0.65rem', color: '#334155', borderRight: '1px solid #e2e8f0', fontSize: '0.72rem' }}>
                                    {fullClass}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                                    {rec.batch_year || '2025-2026'}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem', color: '#0f172a', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                                    {eventName}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', color: '#475569', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                                    {dateStr}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.75rem', color: '#475569', fontSize: '0.7rem', borderRight: '1px solid #e2e8f0' }}>
                                    {orgBy}
                                  </td>
                                  <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                                    {rec.file_path ? (
                                      <button
                                        onClick={() => setPreviewProof(rec)}
                                        title="View Certificate Proof"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.2rem',
                                          padding: '0.2rem 0.5rem',
                                          borderRadius: 4,
                                          fontSize: '0.7rem',
                                          fontWeight: 700,
                                          color: '#1E3870',
                                          background: 'rgba(43,77,145,0.08)',
                                          border: '1px solid rgba(43,77,145,0.2)',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <Eye size={11} />
                                        <span>Proof</span>
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{prize}</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom 3 Signatures (PDF 1) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3.5rem', paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 170, borderBottom: '1px solid #94a3b8', marginBottom: '0.4rem' }} />
                  <div>Head of the Department (HOD)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 170, borderBottom: '1px solid #94a3b8', marginBottom: '0.4rem' }} />
                  <div>Dean — School of Commerce</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 170, borderBottom: '1px solid #94a3b8', marginBottom: '0.4rem' }} />
                  <div>Principal</div>
                </div>
              </div>

              {/* Official Footer */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8' }}>
                STAR TRACKER ERP &bull; KPR College of Arts Science and Research &bull; Official Academic Record Database
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* FORMAT 3: VERTICAL REPORT & SUB-VERTICAL BREAKDOWN            */}
          {/* ============================================================= */}
          {reportType === 'vertical' && (
            <>
              {/* Overall Summary KPI Cards for Verticals */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '0.85rem', 
                marginBottom: '1.5rem' 
              }}>
                <div className="glass-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {selectedVertical === 'all' ? 'Total Verticals' : 'Selected Vertical'}
                  </p>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
                    {selectedVertical === 'all' ? `${verticalMetrics.list.length} Verticals` : verticalMetrics.activeVertical?.verticalCode}
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {selectedVertical === 'all' ? `${verticalMetrics.totalSubVerticalsCount} Sub-Verticals Total` : verticalMetrics.activeVertical?.verticalName}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Students Participated</p>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
                    {selectedVertical === 'all' ? verticalMetrics.allParticipatingStudents : verticalMetrics.activeVertical?.participatingStudents} 
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / {verticalMetrics.totalEnrolled}</span>
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--brand-green)', fontWeight: 600, marginTop: 2 }}>
                    {selectedVertical === 'all' ? `${verticalMetrics.overallParticipationPct}% overall` : `${verticalMetrics.activeVertical?.participationPct}% in vertical`}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Submissions</p>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedVertical === 'all' ? verticalMetrics.totalAllSubmissions : verticalMetrics.activeVertical?.totalSubmissions}
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {selectedVertical === 'all' ? `${verticalMetrics.list.reduce((acc, v) => acc + v.approvedSubmissions, 0)} Approved` : `${verticalMetrics.activeVertical?.approvedSubmissions} Approved`}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Approved SP</p>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-green)' }}>
                    {selectedVertical === 'all' ? verticalMetrics.totalAllSP : verticalMetrics.activeVertical?.totalSP} SP
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Official Star Points
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '0.9rem 1.1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Converted Marks</p>
                  <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#1E3870' }}>
                    {selectedVertical === 'all' ? verticalMetrics.totalAllMarks : verticalMetrics.activeVertical?.totalMarks} Marks
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Formula: 2 SP = 1 Mark
                  </div>
                </div>
              </div>

              {/* Single Vertical View (when a specific vertical is filtered) */}
              {verticalMetrics.activeVertical ? (
                <div>
                  {/* Vertical Summary Banner Card */}
                  <div className="glass-card" style={{ 
                    marginBottom: '1.25rem', 
                    background: 'linear-gradient(135deg, rgba(43,77,145,0.08), rgba(32,142,71,0.08))', 
                    border: '1px solid rgba(43,77,145,0.22)',
                    padding: '1.25rem 1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className="badge badge-mandatory">{verticalMetrics.activeVertical.verticalCode}</span>
                          <span className={`badge ${verticalMetrics.activeVertical.type === 'Mandatory' ? 'badge-approved' : 'badge-optional'}`}>
                            {verticalMetrics.activeVertical.type}
                          </span>
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                          {verticalMetrics.activeVertical.verticalName}
                        </h2>
                      </div>

                      <button 
                        onClick={() => setSelectedVertical('all')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        View All Verticals
                      </button>
                    </div>
                  </div>

                  {/* Sub-Vertical Breakdown Table */}
                  <div className="data-table-card">
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--brand-blue)' }}>
                        Sub-Vertical Activity Breakdown ({verticalMetrics.activeVertical.activities.length} Activities)
                      </h3>
                    </div>

                    <div className="table-container">
                      <table className="data-table" style={{ width: '100%', minWidth: 780, tableLayout: 'fixed' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '6%', textAlign: 'center' }}>#</th>
                            <th style={{ width: '34%', textAlign: 'left' }}>Sub-Vertical / Activity Name</th>
                            <th style={{ width: '12%', textAlign: 'center' }}>Submissions</th>
                            <th style={{ width: '12%', textAlign: 'center' }}>Participated</th>
                            <th style={{ width: '12%', textAlign: 'center' }}>Approved SP</th>
                            <th style={{ width: '12%', textAlign: 'center' }}>Marks</th>
                            <th style={{ width: '12%', textAlign: 'center' }}>Participation %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verticalMetrics.activeVertical.activities.map((act, idx) => (
                            <tr key={act.activityId || idx}>
                              <td style={{ width: '6%', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>
                                {idx + 1}
                              </td>
                              <td style={{ width: '34%', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                                {act.activityName}
                              </td>
                              <td style={{ width: '12%', textAlign: 'center', fontWeight: 700 }}>
                                {act.submissionsCount}
                              </td>
                              <td style={{ width: '12%', textAlign: 'center', fontWeight: 700, color: 'var(--brand-blue)' }}>
                                {act.participatedCount}
                              </td>
                              <td style={{ width: '12%', textAlign: 'center' }}>
                                <span style={{ fontWeight: 700, color: 'var(--brand-green)', background: 'rgba(32,142,71,0.08)', padding: '2px 8px', borderRadius: 6 }}>
                                  {act.totalSP} SP
                                </span>
                              </td>
                              <td style={{ width: '12%', textAlign: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#1E3870', background: 'rgba(43,77,145,0.08)', padding: '2px 8px', borderRadius: 6 }}>
                                  {act.totalMarks}
                                </span>
                              </td>
                              <td style={{ width: '12%', textAlign: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{act.participationPct}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* All Verticals with Direct Sub-Vertical Activity Breakdown */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Top Bar with Expand/Collapse All Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '0.25rem 0' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--brand-blue)' }}>
                        Vertical-Wise Performance & Sub-Vertical Activity Breakdown
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Complete breakdown of student participation, star points, and marks across all verticals (V1 to V10)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        onClick={() => setCollapsedVerticals({})}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Expand All
                      </button>
                      <button 
                        onClick={() => {
                          const allCol = {};
                          verticalMetrics.list.forEach(v => { allCol[v.verticalId] = true; });
                          setCollapsedVerticals(allCol);
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  {/* List of Verticals with Sub-Verticals */}
                  {verticalMetrics.list.map((v) => {
                    const isCollapsed = !!collapsedVerticals[v.verticalId];
                    return (
                      <div 
                        key={v.verticalId} 
                        className="data-table-card"
                        style={{ 
                          border: '1px solid var(--border-color)', 
                          borderRadius: 10, 
                          overflow: 'hidden',
                          transition: 'box-shadow 0.2s ease'
                        }}
                      >
                        {/* Vertical Header Bar */}
                        <div 
                          onClick={() => setCollapsedVerticals(prev => ({ ...prev, [v.verticalId]: !prev[v.verticalId] }))}
                          style={{ 
                            padding: '0.85rem 1.25rem', 
                            background: 'var(--bg-secondary)', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            userSelect: 'none',
                            borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}
                        >
                          {/* Vertical Code & Name */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                            <span className="badge badge-mandatory" style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
                              {v.verticalCode}
                            </span>
                            <span className={`badge ${v.type === 'Mandatory' ? 'badge-approved' : 'badge-optional'}`} style={{ fontSize: '0.68rem' }}>
                              {v.type}
                            </span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {v.verticalName}
                            </span>
                          </div>

                          {/* Summary Stats Pill Group */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              <strong>{v.participatingStudents}</strong> Participated <span style={{ color: 'var(--text-muted)' }}>({v.participationPct}%)</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              <strong>{v.totalSubmissions}</strong> Submissions
                            </div>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 800, 
                              color: 'var(--brand-green)', 
                              background: 'rgba(32,142,71,0.1)', 
                              padding: '2px 8px', 
                              borderRadius: 6 
                            }}>
                              {v.totalSP} SP
                            </span>
                            <span style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 800, 
                              color: '#1E3870', 
                              background: 'rgba(43,77,145,0.1)', 
                              padding: '2px 8px', 
                              borderRadius: 6 
                            }}>
                              {v.totalMarks} Marks
                            </span>
                            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Sub-Verticals Table under this Vertical */}
                        {!isCollapsed && (
                          <div className="table-container">
                            {v.activities.length === 0 ? (
                              <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                No sub-vertical activities configured or matching the filter for this vertical.
                              </div>
                            ) : (
                              <table className="data-table" style={{ width: '100%', minWidth: 780, tableLayout: 'fixed' }}>
                                <thead>
                                  <tr style={{ background: 'var(--bg-primary)' }}>
                                    <th style={{ width: '6%', textAlign: 'center' }}>#</th>
                                    <th style={{ width: '36%', textAlign: 'left' }}>Sub-Vertical / Activity Name</th>
                                    <th style={{ width: '12%', textAlign: 'center' }}>Submissions</th>
                                    <th style={{ width: '12%', textAlign: 'center' }}>Participated</th>
                                    <th style={{ width: '11%', textAlign: 'center' }}>Approved SP</th>
                                    <th style={{ width: '11%', textAlign: 'center' }}>Marks</th>
                                    <th style={{ width: '12%', textAlign: 'center' }}>Participation %</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {v.activities.map((act, idx) => (
                                    <tr key={act.activityId || idx}>
                                      <td style={{ width: '6%', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem' }}>
                                        {idx + 1}
                                      </td>
                                      <td style={{ width: '36%', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                                        {act.activityName}
                                      </td>
                                      <td style={{ width: '12%', textAlign: 'center', fontWeight: 700 }}>
                                        {act.submissionsCount}
                                      </td>
                                      <td style={{ width: '12%', textAlign: 'center', fontWeight: 700, color: 'var(--brand-blue)' }}>
                                        {act.participatedCount}
                                      </td>
                                      <td style={{ width: '11%', textAlign: 'center' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--brand-green)', background: 'rgba(32,142,71,0.08)', padding: '2px 7px', borderRadius: 5, fontSize: '0.75rem' }}>
                                          {act.totalSP} SP
                                        </span>
                                      </td>
                                      <td style={{ width: '11%', textAlign: 'center' }}>
                                        <span style={{ fontWeight: 700, color: '#1E3870', background: 'rgba(43,77,145,0.08)', padding: '2px 7px', borderRadius: 5, fontSize: '0.75rem' }}>
                                          {act.totalMarks}
                                        </span>
                                      </td>
                                      <td style={{ width: '12%', textAlign: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{act.participationPct}%</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Proof Preview Modal */}
          {previewProof && (
            <div className="modal-overlay" onClick={() => setPreviewProof(null)}>
              <div 
                className="modal-content" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 700, padding: 0, overflow: 'hidden' }}
              >
                {/* Modal Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-blue)', margin: 0 }}>
                      Certificate Proof — {previewProof.student_name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {previewProof.activity_name} &bull; {previewProof.roll_no}
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewProof(null)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '1.25rem', textAlign: 'center', background: 'var(--bg-secondary)', maxHeight: '70vh', overflowY: 'auto' }}>
                  {previewProof.file_path ? (
                    previewProof.file_path.toLowerCase().endsWith('.pdf') ? (
                      <div style={{ padding: '2rem 1rem' }}>
                        <FileText size={48} style={{ color: 'var(--brand-blue)', margin: '0 auto 1rem' }} />
                        <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                          {previewProof.proof_file_name || 'Uploaded PDF Document'}
                        </p>
                        <a 
                          href={previewProof.file_path.startsWith('http') ? previewProof.file_path : `/api/uploads/achievements/${previewProof.file_path.split('/').pop()}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <ExternalLink size={15} />
                          <span>Open PDF Document</span>
                        </a>
                      </div>
                    ) : (
                      <div>
                        <img 
                          src={previewProof.file_path.startsWith('http') ? previewProof.file_path : `/api/uploads/achievements/${previewProof.file_path.split('/').pop()}`}
                          alt="Certificate Proof" 
                          style={{ maxWidth: '100%', maxHeight: 450, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border-color)' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none', padding: '2rem 1rem' }}>
                          <Award size={48} style={{ color: 'var(--brand-green)', margin: '0 auto 1rem' }} />
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{previewProof.proof_file_name || 'Certificate Proof File'}</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No proof document uploaded.</p>
                  )}

                  {/* Submission Details footer */}
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem',
                    borderRadius: 8,
                    background: 'var(--bg-primary)',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem'
                  }}>
                    <div><strong>Points Claimed:</strong> {previewProof.claimed_sp} SP ({previewProof.converted_marks || (previewProof.claimed_sp / 2.0).toFixed(1)} Marks)</div>
                    <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{previewProof.status}</span></div>
                    <div><strong>Class Advisor:</strong> {previewProof.advisor_name || 'Class Advisor'}</div>
                    <div><strong>Submitted Date:</strong> {previewProof.submitted_at ? new Date(previewProof.submitted_at).toLocaleDateString() : '—'}</div>
                    {previewProof.student_remarks && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <strong>Student Remarks:</strong> {previewProof.student_remarks}
                      </div>
                    )}
                    {previewProof.advisor_remarks && (
                      <div style={{ gridColumn: 'span 2', color: '#B45309' }}>
                        <strong>Advisor Remarks:</strong> {previewProof.advisor_remarks}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}


