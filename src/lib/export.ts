import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

export function exportPDF(filename: string, title: string, rows: { question: string; correct: boolean; score?: number }[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 10, 10);
  doc.setFontSize(12);
  let y = 20;
  for (const r of rows) {
    const line = `${r.correct ? '✔' : '✘'} ${r.question}`;
    doc.text(line, 10, y);
    y += 8;
    if (y > 280) { doc.addPage(); y = 20; }
  }
  doc.save(filename);
}

export function exportCSV(filename: string, rows: any[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}