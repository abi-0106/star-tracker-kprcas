import React, { useState } from 'react';
import { X, Download, CheckCircle, XCircle, RotateCcw, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ProofViewerModal({ certificate, onClose, isReviewer = false, onReviewSubmitted }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imgLoadError, setImgLoadError] = useState(false);

  if (!certificate) return null;

  const safeStatus = (certificate.status || 'pending').toLowerCase();
  const filePath = certificate.file_path || certificate.storage_path || certificate.proof_file_name || '';
  const proofUrl = `/api/uploads/achievements/${filePath}`;

  const isImage = certificate.proof_file_type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);

  const handleReview = async (action) => {
    if ((action === 'rejected' || action === 'returned') && !remarks.trim()) {
      setErrorMsg(`Advisor remarks are mandatory when ${action === 'rejected' ? 'rejecting' : 'returning'} an achievement.`);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.reviewCertificate(certificate.id, action, remarks);
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Review action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 850, padding: '1.5rem', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
              Achievement Proof Document
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {certificate.student_name} ({certificate.student_reg_no}) &bull; {certificate.activity_name} ({certificate.claimed_sp} SP)
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

        {/* Details Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Vertical</span>
            <strong>{certificate.vertical_code}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Level / Points</span>
            <strong>{certificate.level_name} ({certificate.claimed_sp} SP)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Status</span>
            <span className={`badge badge-${safeStatus}`}>{safeStatus}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Submitted On</span>
            <strong>{new Date(certificate.submitted_at).toLocaleDateString()}</strong>
          </div>
        </div>

        {/* Student Remarks */}
        {certificate.student_remarks && (
          <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: 'var(--bg-primary)', borderRadius: 8, fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Student Remarks: </span>
            <span style={{ color: 'var(--text-primary)' }}>{certificate.student_remarks}</span>
          </div>
        )}

        {/* File Viewer Box */}
        <div style={{
          flex: 1,
          minHeight: 340,
          background: '#111827',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '1rem',
        }}>
          {isImage && !imgLoadError ? (
            <img
              src={proofUrl}
              alt="Proof Document"
              style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }}
              onError={() => setImgLoadError(true)}
            />
          ) : (
            <iframe
              src={proofUrl}
              title="Proof PDF"
              style={{ width: '100%', height: 420, border: 'none' }}
            />
          )}

          {/* Download link button */}
          <a
            href={proofUrl}
            target="_blank"
            rel="noreferrer"
            download
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(0, 0, 0, 0.65)',
              color: '#fff',
              padding: '0.4rem 0.75rem',
              borderRadius: 6,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              textDecoration: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Download size={14} />
            <span>Download</span>
          </a>
        </div>

        {/* Reviewer Action Box */}
        {isReviewer && safeStatus === 'pending' && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {errorMsg && (
              <div style={{ color: '#DC2626', fontSize: '0.82rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Advisor Review Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add verification notes, feedback, or reasons for rejection/return..."
                rows={2}
                className="form-textarea"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {/* Return */}
              <button
                type="button"
                onClick={() => handleReview('returned')}
                disabled={loading}
                className="btn btn-secondary"
                style={{ color: '#6D28D9', borderColor: '#6D28D9', fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                <span>Return for Correction</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => handleReview('rejected')}
                disabled={loading}
                className="btn btn-danger"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                <span>Reject</span>
              </button>

              {/* Approve */}
              <button
                type="button"
                onClick={() => handleReview('approved')}
                disabled={loading}
                className="btn btn-success"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                <span>Approve ({certificate.claimed_sp} SP)</span>
              </button>
            </div>
          </div>
        )}

        {/* Existing Advisor Remarks if already reviewed */}
        {safeStatus !== 'pending' && certificate.advisor_remarks && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Advisor Remarks: </span>
            <span style={{ color: 'var(--text-primary)' }}>{certificate.advisor_remarks}</span>
          </div>
        )}
      </div>
    </div>
  );
}
