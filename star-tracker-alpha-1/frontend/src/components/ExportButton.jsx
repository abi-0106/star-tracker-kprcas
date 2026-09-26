import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { api } from '../services/api';

export default function ExportButton(props) {
  const {
    buttonText,
    label,
    classId,
    loading: externalLoading,
    getExportOptions,
    data,
    columns,
    title,
    fileName,
    filename,
    department,
    className: classPropName,
  } = props;
  const displayText = label ?? buttonText ?? 'Export Report';

  const [isOpen, setIsOpen] = useState(false);
  const [loadingType, setLoadingType] = useState(null);

  const isLoading = externalLoading || loadingType !== null;

  const resolveOptions = async () => {
    if (getExportOptions) {
      return await getExportOptions();
    }
    return {
      title: title || 'Report',
      department,
      className: classPropName,
      columns: columns || [],
      data: data || [],
      fileName: fileName || filename || 'star-tracker-report',
      filename: filename || fileName || 'star-tracker-report',
    };
  };

  const handleExportPDF = async () => {
    setLoadingType('pdf');
    try {
      const options = await resolveOptions();
      await exportToPDF(options);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setLoadingType(null);
      setIsOpen(false);
    }
  };

  const handleExportExcel = async () => {
    setLoadingType('excel');
    try {
      if (classId) {
        // Backend pandas export
        await api.exportClassExcel(classId);
      } else {
        const options = await resolveOptions();
        exportToExcel(options);
      }
    } catch (err) {
      console.error('Excel Export Error:', err);
    } finally {
      setLoadingType(null);
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="btn btn-secondary"
        style={{
          fontSize: '0.82rem',
          padding: '0.45rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        <span>{displayText}</span>
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 170,
              zIndex: 100,
              overflow: 'hidden',
              padding: '0.35rem',
            }}
          >
            <button
              onClick={handleExportPDF}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#DC2626',
                borderRadius: 6,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <FileText size={15} />
              <span>Export as PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--brand-green)',
                borderRadius: 6,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(32, 142, 71, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <FileSpreadsheet size={15} />
              <span>Export as Excel</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
