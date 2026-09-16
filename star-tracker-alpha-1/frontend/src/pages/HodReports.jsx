import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { FileText, Download, Filter, Search, Award } from 'lucide-react';

export default function HodReports() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studRes, clsRes] = await Promise.all([
        api.get('/api/hod/students'),
        api.get('/api/classes')
      ]);
      setStudents(studRes.students || []);
      setClasses(clsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || 
                          s.roll_no?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.class_id === parseInt(selectedClass);
    return matchesSearch && matchesClass;
  });

  const exportData = filteredStudents.map((s, idx) => ({
    'S.No': idx + 1,
    'Roll Number': s.roll_no,
    'Student Name': s.name,
    'Class': s.class_name,
    'Total Star Points': s.total_points || 0,
    'Internal Marks Awarded (2 SP = 1 Mark)': s.calculated_marks || 0,
    'Approved Certificates': s.approved_count || 0
  }));

  const exportColumns = [
    { header: 'S.No', dataKey: 'S.No' },
    { header: 'Roll Number', dataKey: 'Roll Number' },
    { header: 'Student Name', dataKey: 'Student Name' },
    { header: 'Class', dataKey: 'Class' },
    { header: 'Star Points (SP)', dataKey: 'Total Star Points' },
    { header: 'Internal Marks', dataKey: 'Internal Marks Awarded (2 SP = 1 Mark)' },
    { header: 'Approved Certs', dataKey: 'Approved Certificates' }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role="hod" />
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Department Reports & Mark Sheets</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Official consolidated student mark sheets for academic integration
              </p>
            </div>
            <ExportButton 
              data={exportData} 
              filename={`Department_Mark_Sheet_${new Date().toISOString().slice(0,10)}`}
              title="KPRCAS Star Tracker - Consolidated Student Mark Sheet (2 SP = 1 Mark)"
              columns={exportColumns}
            />
          </div>

          {/* Filters */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Search by student name or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full sm:w-48 py-2 px-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border-color)] text-xs uppercase font-semibold text-[var(--text-muted)]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-center">Approved Certs</th>
                    <th className="py-3 px-4 text-center">Star Points (SP)</th>
                    <th className="py-3 px-4 text-center">Internal Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-[var(--text-muted)]">
                        No student records found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-mono text-xs text-[var(--text-muted)]">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-main)]">{s.roll_no}</td>
                        <td className="py-3.5 px-4 font-medium text-[var(--text-main)]">{s.name}</td>
                        <td className="py-3.5 px-4 text-[var(--text-muted)]">{s.class_name}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{s.approved_count || 0}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-[var(--primary)]">{s.total_points || 0} SP</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {s.calculated_marks || 0} Marks
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
