import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export async function exportToPDF(options) {
  const {
    title,
    department = 'School of IT Integrated Commerce',
    className,
    generatedBy = 'STAR Tracker Portal',
    columns,
    data,
    fileName = 'star-tracker-report',
    orientation = 'landscape',
  } = options;

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
      if (col.formatter) return col.formatter(row[col.key], row);
      if (col.key === 'index') return String(idx + 1);
      return row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—';
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

  doc.save(`${fileName}.pdf`);
}

export function exportToExcel(options) {
  const { title, columns, data, fileName = 'star-tracker-report' } = options;

  const excelRows = data.map((row, idx) => {
    const obj = {};
    columns.forEach(col => {
      if (col.formatter) {
        obj[col.header] = col.formatter(row[col.key], row);
      } else if (col.key === 'index') {
        obj[col.header] = idx + 1;
      } else {
        obj[col.header] = row[col.key] ?? '—';
      }
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(excelRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31) || 'Report');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
