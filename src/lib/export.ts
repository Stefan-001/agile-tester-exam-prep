import jsPDF from 'jspdf';
import { QuizResult, StudyProgress } from './types';

export function exportCSV(rows: string[][], filename = 'export.csv') {
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportProgressPDF(progress: StudyProgress, results: QuizResult[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Agile Tester Exam Prep - Progress Report', 14, 20);
  doc.setFontSize(12);
  doc.text(`User ID: ${progress.userId}`, 14, 30);
  doc.text(`Updated: ${new Date(progress.updatedAt).toLocaleString()}`, 14, 38);
  doc.text(`Badges: ${progress.badges.join(', ') || 'None'}`, 14, 46);
  doc.text(`Streak: ${progress.streakDays} day(s)`, 14, 54);

  let y = 66;
  doc.text('Topic Mastery:', 14, y);
  y += 8;
  for (const tm of progress.topicMastery) {
    doc.text(`- ${tm.topicId}: ${(tm.accuracy * 100).toFixed(0)}% over ${tm.attempts} attempts`, 18, y);
    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  y += 6;
  doc.text('Recent Results (up to 20):', 14, y);
  y += 8;
  for (const r of results.slice(-20)) {
    const line = `${new Date(r.createdAt).toLocaleString()} Q:${r.questionId} ${r.correct ? '✔' : '✘'} conf:${r.confidence}`;
    doc.text(line, 18, y);
    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  doc.save('progress.pdf');
}