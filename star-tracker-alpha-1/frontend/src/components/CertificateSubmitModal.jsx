import React, { useState, useEffect } from 'react';
import { X, UploadCloud, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function CertificateSubmitModal({ onClose, onSubmitted }) {
  const [verticals, setVerticals] = useState([]);
  const [selectedVerticalId, setSelectedVerticalId] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [studentRemarks, setStudentRemarks] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.getVerticals()
      .then(data => {
        if (data && data.verticals) {
          setVerticals(data.verticals);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const selectedVertical = verticals.find(v => v.id === Number(selectedVerticalId));
  const availableActivities = selectedVertical?.activities || [];
  const selectedActivity = availableActivities.find(a => a.id === Number(selectedActivityId));
  const availableLevels = selectedActivity?.levels || [];
  const selectedLevel = availableLevels.find(l => l.id === Number(selectedLevelId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivityId || !selectedLevelId || !file) {
      setErrorMsg('Please select an activity, level, and choose a valid certificate proof file.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('activity_id', String(selectedActivityId));
      formData.append('level_id', String(selectedLevelId));
      formData.append('student_remarks', studentRemarks);
      formData.append('proof_file', file);

      await api.submitCertificate(formData);
      setSuccessMsg('Certificate submitted successfully for advisor review!');
      setTimeout(() => {
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
              Submit Achievement Proof
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Upload document proof to claim Star Points (2 SP = 1 Internal Mark)
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

        {errorMsg && (
          <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.25)', color: '#B91C1C', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(32, 142, 71, 0.12)', border: '1px solid rgba(32, 142, 71, 0.3)', color: '#186D37', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Vertical Selection */}
          <div className="form-group">
            <label className="form-label">1. Select Vertical (V1 – V10)</label>
            <select
              className="form-select"
              value={selectedVerticalId}
              onChange={(e) => {
                setSelectedVerticalId(e.target.value);
                setSelectedActivityId('');
                setSelectedLevelId('');
              }}
              required
            >
              <option value="">-- Choose Vertical --</option>
              {verticals.map(v => (
                <option key={v.id} value={v.id}>
                  {v.code}: {v.name} ({v.type} — Max: {v.max_sp} SP)
                </option>
              ))}
            </select>
          </div>

          {/* Activity Selection */}
          {selectedVertical && (
            <div className="form-group">
              <label className="form-label">2. Select Activity</label>
              <select
                className="form-select"
                value={selectedActivityId}
                onChange={(e) => {
                  setSelectedActivityId(e.target.value);
                  setSelectedLevelId('');
                }}
                required
              >
                <option value="">-- Choose Activity --</option>
                {availableActivities.map(a => (
                  <option key={a.id} value={a.id}>
                    Activity {a.activity_no}: {a.name} (Max {a.max_sp} SP) {a.is_bonus_eligible ? '★ Bonus Eligible' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Level Selection */}
          {selectedActivity && (
            <div className="form-group">
              <label className="form-label">3. Select Achievement Level</label>
              <select
                className="form-select"
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(e.target.value)}
                required
              >
                <option value="">-- Choose Level / Tier --</option>
                {availableLevels.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.level_name} — {l.description} ({l.sp_points} Star Points)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SP Claimed Summary Badge */}
          {selectedLevel && (
            <div style={{ background: 'var(--brand-green-light)', border: '1px solid rgba(32,142,71,0.25)', padding: '0.65rem 0.85rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--brand-green-dark)', fontWeight: 600 }}>
                Points to be Claimed:
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-green)' }}>
                {selectedLevel.sp_points} SP
              </span>
            </div>
          )}

          {/* File Upload Box */}
          <div className="form-group">
            <label className="form-label">4. Certificate / Proof Document (PDF or Image, max 15MB)</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 8,
              padding: '1.25rem',
              textAlign: 'center',
              background: 'var(--bg-primary)',
              cursor: 'pointer',
            }}>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                style={{ display: 'none' }}
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <UploadCloud size={28} color="var(--brand-blue)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {file ? file.name : 'Click to browse and upload file'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Accepted: PDF, PNG, JPG, JPEG (Max 15MB)
                </span>
              </label>
            </div>
          </div>

          {/* Student Remarks */}
          <div className="form-group">
            <label className="form-label">5. Remarks / Details (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={studentRemarks}
              onChange={(e) => setStudentRemarks(e.target.value)}
              placeholder="e.g. Completed 12-week NPTEL course with 88% Elite Gold score..."
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: 140 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
