'use client';
import { useEffect, useState } from 'react';
import { fetchAllTopics, type Topic } from '../lib/data';
import { ProgressBar } from '../components/ProgressBar';

export default function DashboardPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const t = await fetchAllTopics();
      setTopics(t);
      const stored = Number(localStorage.getItem('progress') || '0');
      setProgress(Math.min(100, stored));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div>
        <div className="mb-2">Overall Progress</div>
        <ProgressBar value={progress} />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Topics loaded: {topics.length}. Data is sourced only from Documents/*.pdf via CI preprocessing.
      </div>
    </div>
  );
}