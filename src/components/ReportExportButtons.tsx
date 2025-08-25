'use client';
import { exportCSV, exportPDF } from '../lib/export';

export function ReportExportButtons({ rows, title }: { rows: { question: string; correct: boolean; score?: number }[], title: string }) {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 border rounded" onClick={() => exportPDF('report.pdf', title, rows)}>Export PDF</button>
      <button className="px-3 py-1 border rounded" onClick={() => exportCSV('report.csv', rows)}>Export CSV</button>
    </div>
  );
}