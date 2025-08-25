import { useEffect, useMemo, useState } from 'react';
import { parseSyllabus } from '@/lib/parser';
import { Flashcard } from '@/lib/types';
import FlashcardView from '@/components/Flashcard';
import { isDue, scheduleSM2 } from '@/lib/spacedRepetition';
import { shuffle } from '@/lib/util';

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [deck, setDeck] = useState<Flashcard[]>([]);

  useEffect(() => {
    parseSyllabus().then(({ flashcards }) => {
      // Deduplicate by term (ignoring variant suffix like "(vN)")
      const seen = new Set<string>();
      const norm = (t: string) => t.replace(/\s*\(v\d+\)$/i, '').trim().toLowerCase();
      const unique = flashcards.filter((c) => {
        const key = norm(c.term);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setCards(unique);
    });
  }, []);

  useEffect(() => {
    const due = cards.filter((c) => isDue(c));
    const base = due.length ? due : cards;
    setDeck(shuffle(base));
    setIndex(0);
  }, [cards]);

  const current = deck[index];

  function rate(q: 0 | 1 | 2 | 3 | 4 | 5) {
  const updated = scheduleSM2(current, q);
    setCards((prev) => prev.map((c) => (c.id === current.id ? updated : c)));
    setIndex((i) => {
      const next = i + 1;
      if (next >= deck.length) {
        // End of cycle: reshuffle the deck for a fresh order next pass
        const due = cards.filter((c) => isDue(c));
        const base = due.length ? due : cards;
        setDeck(shuffle(base));
        return 0;
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Flashcards</h1>
      {current ? <FlashcardView card={current} onRate={rate} /> : <div className="card">Loading flashcards...</div>}
      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-secondary" onClick={() => setIndex((i) => (i - 1 + deck.length) % deck.length)} disabled={index === 0}>
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={() =>
            setIndex((i) => {
              const next = i + 1;
              if (next >= deck.length) {
                const due = cards.filter((c) => isDue(c));
                const base = due.length ? due : cards;
                setDeck(shuffle(base));
                return 0;
              }
              return next;
            })
          }
        >
          Next
        </button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Card {index + 1} of {deck.length}
      </div>
    </div>
  );
}