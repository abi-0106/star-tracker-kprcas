import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Grid, List, Eye, Download, CheckCircle, XCircle, ArrowLeft, ArrowRight, FileText, Calendar, Award, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import ExportButton from './ExportButton';

export default function StudentGalleryModal({ studentId, onClose, onRefreshParent, readOnly = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [previewIndex, setPreviewIndex] = useState(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudentData = () => {
    setLoading(true);
    api.getStudentCertificatesForAdvisor(studentId)
      .then(res => {
        setData(res);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (studentId) fetchStudentData();
  }, [studentId]);

  const certificates = data?.certificates || [];

  const filteredCerts = certificates.filter(c => {
    const matchesSearch =
      c.activity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vertical_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vertical_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVertical = selectedVertical === 'all' || c.vertical_code === selectedVertical;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesSearch && matchesVertical && matchesStatus;
  });

  const activeCert = previewIndex !== null ? filteredCerts[previewIndex] : null;

  const handleReview = async (action) => {
    if (!activeCert) return;
    setActionLoading(true);
    try {
      await api.reviewCertificate(activeCert.id, action, remarksInput);
      fetchStudentData();
      if (onRefreshParent) onRefreshParent();
      setPreviewIndex(null);
      setRemarksInput('');
    } catch (err) {
      alert(err.message || 'Review action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const verticalsList = Array.from(new Set(certificates.map(c => c.vertical_code))).filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 1050, width: '95%', maxHeight: '92vh', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
              {data?.student ? `${data.student.name} — Achievement Gallery` : 'Student Achievement Gallery'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {data?.student?.reg_no_emp_id} &bull; {data?.student?.class_name} ({data?.student?.class_section}) &bull; Total Points: <strong style={{ color: 'var(--brand-green)' }}>{data?.scores?.total_sp || 0} SP</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search activity or vertical..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: 32, fontSize: '0.82rem' }}
            />
          </div>

          <select
            value={selectedVertical}
            onChange={e => setSelectedVertical(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.82rem' }}
          >
            <option value="all">All Verticals</option>
            {verticalsList.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.82rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="returned">Returned</option>
          </select>

          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 6, overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.45rem 0.65rem', background: viewMode === 'grid' ? 'var(--brand-green)' : 'transparent', color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)' }}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{ padding: '0.45rem 0.65rem', background: viewMode === 'list' ? 'var(--brand-green)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)' }}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 300 }}>
          {filteredCerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Award size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p>No achievements match the selected filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {filteredCerts.map((c, idx) => {
                const filePath = c.file_path || c.storage_path || c.proof_file_name;
                const isImg = c.proof_file_type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
                return (
                  <div
                    key={c.id}
                    onClick={() => setPreviewIndex(idx)}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ height: 130, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {isImg ? (
                        <img src={`/api/uploads/achievements/${filePath}`} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FileText size={36} color="#94a3b8" />
                      )}
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{c.vertical_code}</span>
                        <span className={`badge badge-${c.status || 'pending'}`} style={{ fontSize: '0.65rem' }}>{c.status}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.activity_name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{c.level_name}</span>
                        <strong style={{ color: 'var(--brand-green)' }}>+{c.claimed_sp} SP</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredCerts.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => setPreviewIndex(idx)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--brand-blue)', minWidth: 35 }}>{c.vertical_code}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.activity_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.level_name} &bull; {new Date(c.submitted_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <strong style={{ color: 'var(--brand-green)' }}>+{c.claimed_sp} SP</strong>
                    <span className={`badge badge-${c.status || 'pending'}`}>{c.status}</span>
                    <Eye size={16} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Modal Previewer Drawer if previewIndex selected */}
        {activeCert && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 110,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setPreviewIndex(null)} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem' }}>
                  <ArrowLeft size={15} /> Back
                </button>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  {activeCert.vertical_code}: {activeCert.activity_name} ({activeCert.claimed_sp} SP)
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge badge-${activeCert.status}`}>{activeCert.status}</span>
                <button onClick={() => setPreviewIndex(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <iframe
                src={`/api/uploads/achievements/${activeCert.file_path || activeCert.storage_path || activeCert.proof_file_name}`}
                title="Proof Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            {!readOnly && activeCert.status === 'pending' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Advisor review remarks..."
                  value={remarksInput}
                  onChange={e => setRemarksInput(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.82rem' }}
                />
                <button
                  onClick={() => handleReview('returned')}
                  disabled={actionLoading}
                  className="btn btn-secondary"
                  style={{ color: '#6D28D9', borderColor: '#6D28D9', padding: '0.45rem 0.85rem' }}
                >
                  <RotateCcw size={14} /> Return
                </button>
                <button
                  onClick={() => handleReview('rejected')}
                  disabled={actionLoading}
                  className="btn btn-danger"
                  style={{ padding: '0.45rem 0.85rem' }}
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  onClick={() => handleReview('approved')}
                  disabled={actionLoading}
                  className="btn btn-success"
                  style={{ padding: '0.45rem 1rem' }}
                >
                  <CheckCircle size={14} /> Approve (+{activeCert.claimed_sp} SP)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
