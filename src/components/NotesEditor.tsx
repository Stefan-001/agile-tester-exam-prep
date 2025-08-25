import { useEffect, useState } from 'react';

export default function NotesEditor({ topicId }: { topicId: string }) {
  const key = `agile:notes:${topicId}`;
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(localStorage.getItem(key) || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  function save() {
    localStorage.setItem(key, value);
  }

  return (
    <div className="card">
      <h3 className="mb-2 font-semibold">Notes for {topicId}</h3>
      <textarea className="input h-40" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Write your notes here..." aria-label={`Notes for ${topicId}`} />
      <div className="mt-2">
        <button className="btn btn-primary" onClick={save}>
          Save notes
        </button>
      </div>
    </div>
  );
}