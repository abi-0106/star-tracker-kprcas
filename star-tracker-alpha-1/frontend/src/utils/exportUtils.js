import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export async function exportToPDF(options) {
  const {
    title = 'STAR Tracker Report',
    department = 'School of IT Integrated Commerce',
    className,
    generatedBy = 'STAR Tracker Portal',
    columns = [],
    data = [],
    fileName,
    filename,
    orientation = 'landscape',
  } = options;

  const actualFileName = fileName || filename || 'star-tracker-report';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  // Header branding
  doc.setFillColor(43, 77, 145); // Brand Blue
  doc.rect(0, 0, doc.internal.pageSize.width, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KPR COLLEGE OF ARTS SCIENCE AND RESEARCH', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`STAR TRACKER ERP — ${department.toUpperCase()}`, 14, 18);

  // Subheader
  doc.setTextColor(32, 142, 71); // Brand Green
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 32);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const metaText = [
    className ? `Class: ${className}` : '',
    `Generated: ${new Date().toLocaleDateString('en-GB')}`,
    generatedBy ? `By: ${generatedBy}` : '',
  ].filter(Boolean).join('   |   ');
  doc.text(metaText, 14, 38);

  // Table Body
  const headers = columns.map(col => col.header);
  const rows = data.map((row, idx) => {
    return columns.map(col => {
      const key = col.key || col.dataKey;
      if (col.formatter) return col.formatter(key ? row[key] : '', row);
      if (key === 'index' || key === 'S.No') return String(idx + 1);
      return (key && row[key] !== undefined && row[key] !== null) ? String(row[key]) : '—';
    });
  });

  autoTable(doc, {
    startY: 42,
    head: [headers],
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [43, 77, 145],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${actualFileName}.pdf`);
}

export function exportToExcel(options) {
  const { title = 'Report', columns = [], data = [], fileName, filename } = options;
  const actualFileName = fileName || filename || 'star-tracker-report';

  const excelRows = data.map((row, idx) => {
    const obj = {};
    columns.forEach(col => {
      const key = col.key || col.dataKey;
      if (col.formatter) {
        obj[col.header] = col.formatter(key ? row[key] : '', row);
      } else if (key === 'index' || key === 'S.No') {
        obj[col.header] = idx + 1;
      } else {
        obj[col.header] = (key && row[key] !== undefined && row[key] !== null) ? row[key] : '—';
      }
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(excelRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31) || 'Report');
  XLSX.writeFile(wb, `${actualFileName}.xlsx`);
}
