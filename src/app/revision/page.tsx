'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchAllTopics } from '../../lib/data';
import { initCard, pickDue, review, type CardState } from '../../lib/spacedRepetition';

export default function RevisionPage() {
  const [cards, setCards] = useState<CardState[]>([]);
  const [current, setCurrent] = useState<CardState | null>(null);

  useEffect(() => {
    (async () => {
      const topics = await fetchAllTopics();
      const key = 'spacedCards';
      let saved: CardState[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (!saved.length) {
        // Build cards from terms
        const terms = topics.flatMap(t => t.terms.map((x, i) => ({ id: `${t.id}-term-${i}` })));
        saved = terms.map(t => initCard(t.id));
      }
      setCards(saved);
      setCurrent(pickDue(saved, Date.now(), 1)[0] || null);
    })();
  }, []);

  const grade = (q: 0|1|2|3|4|5) => {
    if (!current) return;
    const next = cards.map(c => c.id === current.id ? review(c, q) : c);
    setCards(next);
    localStorage.setItem('spacedCards', JSON.stringify(next));
    setCurrent(pickDue(next, Date.now(), 1)[0] || null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Revision (Spaced Repetition)</h1>
      {!current ? <div>No cards due. Great job!</div> : (
        <div className="space-y-2">
          <div>Card: {current.id}</div>
          <div className="flex gap-2">
            {[0,1,2,3,4,5].map(n => <button key={n} className="px-3 py-1 border rounded" onClick={() => grade(n as any)}>{n}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}