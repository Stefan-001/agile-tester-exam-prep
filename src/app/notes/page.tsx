'use client';
import { useEffect, useState } from 'react';
import { fetchAllTopics, type Topic } from '../../lib/data';

export default function NotesPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => { (async () => setTopics(await fetchAllTopics()))(); }, []);
  useEffect(() => { setNotes(JSON.parse(localStorage.getItem('notes') || '{}')); }, []);
  const save = (t: string, v: string) => {
    const next = { ...notes, [t]: v };
    setNotes(next);
    localStorage.setItem('notes', JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Notes</h1>
      {topics.map(t => (
        <div key={t.id} className="space-y-2">
          <div className="font-semibold">{t.title}</div>
          <textarea className="w-full border rounded p-2" rows={4} value={notes[t.id] || ''} onChange={(e) => save(t.id, e.target.value)} />
        </div>
      ))}
    </div>
  );
}