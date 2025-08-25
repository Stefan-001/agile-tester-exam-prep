'use client';
import { useEffect, useState } from 'react';
import { fetchAllTopics } from '../../lib/data';
import { initCard, pickDue, review, type CardState } from '../../lib/spacedRepetition';

export default function RevisionPage() {
  const [cards, setCards] = useState<CardState[]>([]);
  const [dueCards, setDueCards] = useState<CardState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [topicsData, setTopicsData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const topics = await fetchAllTopics();
      setTopicsData(topics);
      const allTerms = topics.flatMap(t => t.terms.map((term, i) => ({ id: `${t.id}-term-${i}`, term: term.term, definition: term.definition })));
      
      let saved: CardState[] = [];
      try {
        saved = JSON.parse(localStorage.getItem('cards') || '[]');
      } catch (e) {
        saved = [];
      }
      
      const cardMap = new Map(saved.map(c => [c.id, c]));
      const newCards = allTerms.map(term => cardMap.get(term.id) || initCard(term.id));
      
      setCards(newCards);
      setDueCards(pickDue(newCards));
    })();
  }, []);

  const rate = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (dueCards.length === 0) return;
    
    const current = dueCards[currentIndex];
    const updated = review(current, quality);
    
    const newCards = cards.map(c => c.id === current.id ? updated : c);
    setCards(newCards);
    localStorage.setItem('cards', JSON.stringify(newCards));
    
    const newDue = pickDue(newCards);
    setDueCards(newDue);
    setCurrentIndex(0);
  };

  const findTerm = (id: string) => {
    for (const topic of topicsData) {
      const termIndex = parseInt(id.split('-term-')[1]);
      if (topic.terms[termIndex]) {
        return topic.terms[termIndex];
      }
    }
    return null;
  };

  const current = dueCards[currentIndex];
  const term = current ? findTerm(current.id) : null;

  if (!current) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Revision</h1>
        <p>No cards due for review! Check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Revision</h1>
      <div className="text-sm text-gray-600">
        Cards due: {dueCards.length} | Current: {currentIndex + 1}
      </div>
      
      {term && (
        <div className="border rounded p-4 space-y-4">
          <div className="text-lg font-semibold">{term.term}</div>
          <div className="text-gray-700 dark:text-gray-300">{term.definition}</div>
          
          <div>
            <div className="mb-2 text-sm">How well did you remember?</div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map(q => (
                <button 
                  key={q} 
                  className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => rate(q as 0 | 1 | 2 | 3 | 4 | 5)}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              0: Complete blackout, 5: Perfect recall
            </div>
          </div>
        </div>
      )}
    </div>
  );
}