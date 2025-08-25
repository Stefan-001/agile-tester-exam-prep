'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchAllTopics, type Topic } from '../../lib/data';
import { Flashcard } from '../../components/Flashcard';

export default function FlashcardsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  useEffect(() => { (async () => setTopics(await fetchAllTopics()))(); }, []);
  const terms = useMemo(() => topics.flatMap(t => t.terms), [topics]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Flashcards</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {terms.map((x, i) => <Flashcard key={i} term={x.term} definition={x.definition} />)}
      </div>
    </div>
  );
}