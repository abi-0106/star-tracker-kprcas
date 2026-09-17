import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ExportButton from '../components/ExportButton';
import { api } from '../services/api';
import { Users, Mail, Phone, BookOpen, Award, CheckCircle, Clock } from 'lucide-react';

export default function HodAdvisors() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/hod/advisors');
      setAdvisors(data.advisors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = advisors.map(a => ({
    'Advisor Name': a.name,
    'Email': a.email,
    'Assigned Class': a.class_name || 'Unassigned',
    'Total Students': a.total_students || 0,
    'Pending Approvals': a.pending_reviews || 0,
    'Total Approved': a.approved_count || 0
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="flex">
        <Sidebar role="hod" />
        <main className="portal-main flex-1 p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Class Advisors Directory</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Monitor faculty advisors, student distribution, and approval workloads
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ExportButton 
                data={exportData} 
                filename="Department_Class_Advisors" 
                title="KPRCAS Star Tracker - Department Faculty Advisors"
                columns={[
                  { header: 'Advisor Name', dataKey: 'Advisor Name' },
                  { header: 'Email', dataKey: 'Email' },
                  { header: 'Assigned Class', dataKey: 'Assigned Class' },
                  { header: 'Total Students', dataKey: 'Total Students' },
                  { header: 'Pending Reviews', dataKey: 'Pending Approvals' },
                  { header: 'Total Approved', dataKey: 'Total Approved' }
                ]}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : advisors.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 text-center text-[var(--text-muted)]">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-lg">No Faculty Advisors Assigned</p>
              <p className="text-sm mt-1">Advisors assigned to your department will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisors.map((adv) => (
                <div 
                  key={adv.id} 
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold text-lg">
                          {adv.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text-main)]">{adv.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                            {adv.class_name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{adv.email}</span>
                      </div>
                      {adv.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{adv.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[var(--bg-main)] p-3 rounded-lg text-center border border-[var(--border-color)]">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" /> Students
                      </div>
                      <div className="text-base font-bold text-[var(--text-main)] mt-0.5">
                        {adv.total_students || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> Pending
                      </div>
                      <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        {adv.pending_reviews || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" /> Approved
                      </div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {adv.approved_count || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
