import { useEffect, useMemo, useState } from 'react';
import { parseSyllabus } from '@/lib/parser';
import { Flashcard } from '@/lib/types';
import FlashcardView from '@/components/Flashcard';
import { isDue, scheduleSM2 } from '@/lib/spacedRepetition';

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [deck, setDeck] = useState<Flashcard[]>([]);

  useEffect(() => {
    parseSyllabus().then(({ flashcards }) => {
      setCards(flashcards);
    });
  }, []);

  useEffect(() => {
    const due = cards.filter((c) => isDue(c));
    setDeck(due.length ? due : cards);
    setIndex(0);
  }, [cards]);

  const current = deck[index];

  function rate(q: 0 | 1 | 2 | 3 | 4 | 5) {
    const updated = scheduleSM2(current, q);
    setCards((prev) => prev.map((c) => (c.id === current.id ? updated : c)));
    setIndex((i) => (i + 1) % deck.length);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Flashcards</h1>
      {current ? <FlashcardView card={current} onRate={rate} /> : <div className="card">Loading flashcards...</div>}
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Card {index + 1} of {deck.length}
      </div>
    </div>
  );
}