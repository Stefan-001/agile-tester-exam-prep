'use client';
import { useState } from 'react';

export function Flashcard({ term, definition }: { term: string; definition: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="border p-4 rounded shadow-sm bg-white dark:bg-gray-900 cursor-pointer" onClick={() => setFlipped(v => !v)}>
      {!flipped ? <div className="font-semibold">{term}</div> : <div className="text-sm text-gray-700 dark:text-gray-300">{definition}</div>}
    </div>
  );
}