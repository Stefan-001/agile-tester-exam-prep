'use client';
import type { Option, Question } from '../lib/data';

export function QuizQuestion({
  q, onChange, selected
}: { q: Question & { id: string }, onChange: (id: string, sel: string[]) => void, selected: string[] }) {
  const toggle = (opt: Option) => {
    const multi = q.multi || q.options.filter(o => o.correct).length > 1;
    let next = new Set(selected);
    if (multi) {
      next.has(opt.id) ? next.delete(opt.id) : next.add(opt.id);
    } else {
      next = new Set([opt.id]);
    }
    onChange(q.id, [...next]);
  };
  return (
    <div className="border rounded p-4 space-y-2">
      <div className="font-medium">{q.stem}</div>
      <ul className="space-y-1">
        {q.options.map(o => (
          <li key={o.id}>
            <label className="flex gap-2 items-start">
              <input
                type={q.multi ? 'checkbox' : 'radio'}
                name={q.id}
                checked={selected.includes(o.id)}
                onChange={() => toggle(o)}
              />
              <span>{o.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}