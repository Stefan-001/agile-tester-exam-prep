"use client";
import { useState } from 'react';
import classNames from 'classnames';
import { Flashcard as FlashcardType } from '@/lib/types';

export default function Flashcard({ card, onRate }: { card: FlashcardType; onRate: (q: 0 | 1 | 2 | 3 | 4 | 5) => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="card w-full">
      <div className="mb-2 text-sm text-gray-500">
        <div>Topic: {card.topicId}</div>
        {card.source ? <div className="text-xs">Source: {card.source.pdf}, p.{card.source.page}</div> : null}
      </div>
      <div
        className={classNames(
          'flex cursor-pointer items-center justify-center rounded border p-8 text-center',
          'border-gray-300 dark:border-gray-700'
        )}
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' ? setFlipped((v) => !v) : null)}
        aria-label="Flip card"
      >
        {!flipped ? <div className="text-xl font-semibold">{card.term}</div> : <div className="text-lg">{card.definition}</div>}
      </div>
      <div className="mt-4">
        <p className="mb-2 text-sm">How well did you recall?</p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((q) => (
            <button key={q} className="btn btn-secondary" onClick={() => onRate(q as 0 | 1 | 2 | 3 | 4 | 5)}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}