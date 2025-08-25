import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import Leaderboard from '@/components/Leaderboard';
import { useEffect, useState } from 'react';
import { loadResults, loadProgress } from '@/lib/db';
import { getCurrentLocalUser } from '@/lib/auth';
import { computeTopicHeatmap, getBestSessions } from '@/lib/analytics';
import Heatmap from '@/components/Heatmap';
import { exportCSV, exportProgressPDF } from '@/lib/export';

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [entries, setEntries] = useState<{ label: string; score: number; date: string }[]>([]);
  const [heatmap, setHeatmap] = useState<{ topic: string; accuracy: number }[]>([]);

  useEffect(() => {
    const user = getCurrentLocalUser();
    if (!user) return;
  loadResults(user.id).then((results) => {
      const total = results.length;
      const correct = results.filter((r) => r.correct).length;
      setProgress(total ? Math.round((correct / total) * 100) : 0);

      // Fake best sessions derived from last 5 sets of 10 answers
      const chunk = 10;
      const sessions: { label: string; score: number; date: string }[] = [];
      for (let i = 0; i < results.length; i += chunk) {
        const slice = results.slice(i, i + chunk);
        if (!slice.length) continue;
        const score = Math.round((slice.filter((r) => r.correct).length / slice.length) * 100);
        sessions.push({ label: `Session ${Math.floor(i / chunk) + 1}`, score, date: slice[slice.length - 1].createdAt });
      }
      setEntries(sessions);

  const heat = computeTopicHeatmap(results);
      setHeatmap(heat);
    });

    loadProgress(user?.id || '').then(() => {
      // could set badges and streaks here
    });
    if (user) {
      getBestSessions(user.id).then(setEntries);
    }
  }, []);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="mb-2 text-2xl font-bold">Welcome to Agile Tester Exam Prep</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Prepare for the Certified Tester Foundation Level Extension – Agile Tester exam. This app generates quizzes and flashcards from syllabus content placed in the Documents folder.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProgressBar value={progress} label="Overall Progress" />
          <div className="flex items-center gap-2">
            <Link href="/quiz" className="btn btn-primary">
              Start Quiz
            </Link>
            <Link href="/flashcards" className="btn btn-secondary">
              Review Flashcards
            </Link>
            <Link href="/exam" className="btn btn-secondary">
              Exam Simulator
            </Link>
            <button
              className="btn btn-secondary"
              onClick={async () => {
                const user = getCurrentLocalUser();
                if (!user) return;
                const results = await loadResults(user.id);
                const rows = [[ 'createdAt', 'questionId', 'correct', 'confidence', 'selected' ], ...results.map(r => [r.createdAt, r.questionId, String(r.correct), r.confidence, JSON.stringify(r.selected)])];
                exportCSV(rows, 'results.csv');
              }}
            >
              Export CSV
            </button>
            <button
              className="btn btn-secondary"
              onClick={async () => {
                const user = getCurrentLocalUser();
                if (!user) return;
                const [results, progress] = await Promise.all([loadResults(user.id), loadProgress(user.id)]);
                if (!progress) return;
                exportProgressPDF(progress, results);
              }}
            >
              Export PDF
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Leaderboard entries={entries} />
        <div className="card">
          <h3 className="mb-2 text-lg font-semibold">Topic Mastery Heatmap</h3>
          <Heatmap data={heatmap} />
        </div>
      </section>

      <section className="card">
        <h3 className="mb-2 text-lg font-semibold">Personalized Study Recommendations</h3>
        <ul className="list-disc pl-5 text-sm">
          <li>Focus on topics with low accuracy in the heatmap.</li>
          <li>Use Adaptive Quiz mode to reinforce weak areas.</li>
          <li>Practice with Exam Simulator for timed conditions.</li>
        </ul>
      </section>
    </div>
  );
}