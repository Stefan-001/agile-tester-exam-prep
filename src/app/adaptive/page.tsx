'use client';
import { useEffect, useState } from 'react';
import { fetchAllTopics, type Topic } from '../../lib/data';
import { nextAdaptiveBatch, type TopicStats } from '../../lib/adaptive';
import { QuizQuestion } from '../../components/QuizQuestion';

export default function AdaptivePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<TopicStats>({});
  const [batch, setBatch] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  useEffect(() => { (async () => setTopics(await fetchAllTopics()))(); }, []);
  useEffect(() => { if (topics.length) setBatch(nextAdaptiveBatch(topics, stats, 8)); }, [topics, stats]);

  const submit = () => {
    const updated = { ...stats };
    batch.forEach((q: any) => {
      const chosen = new Set(answers[q.id] || []);
      const correct = new Set(q.options.filter((o: any) => o.correct).map((o: any) => o.id));
      const ok = chosen.size === correct.size && [...chosen].every(x => correct.has(x));
      const topicId = q.topicId || 't0';
      updated[topicId] = updated[topicId] || { correct: 0, total: 0 };
      updated[topicId].total += 1;
      if (ok) updated[topicId].correct += 1;
    });
    setStats(updated);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Adaptive Learning</h1>
      {batch.map((q: any) =>
        <QuizQuestion key={q.id} q={q} selected={answers[q.id] || []} onChange={(id, sel) => setAnswers(a => ({ ...a, [id]: sel }))} />
      )}
      <button className="px-3 py-1 border rounded" onClick={submit}>Submit batch</button>
    </div>
  );
}