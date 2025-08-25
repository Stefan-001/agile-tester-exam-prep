import { useEffect, useState } from 'react';
import NotesEditor from '@/components/NotesEditor';
import { parseSyllabus } from '@/lib/parser';

export default function NotesPage() {
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    parseSyllabus().then(({ topics }) => {
      setTopics(topics);
      setSelected(topics[0]?.id || '');
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notes</h1>
      <div className="card">
        <label className="label" htmlFor="topic">
          Topic
        </label>
        <select id="topic" className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {selected ? <NotesEditor topicId={selected} /> : <div className="card">Loading topics...</div>}
    </div>
  );
}