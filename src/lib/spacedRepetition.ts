import { Flashcard } from './types';

/**
 * Simple SM-2 implementation for scheduling flashcards based on quality (0..5).
 * Returns updated card scheduling fields.
 */
export function scheduleSM2(card: Flashcard, quality: 0 | 1 | 2 | 3 | 4 | 5, now = new Date()): Flashcard {
  let ef = card.easeFactor ?? 2.5;
  let reps = card.repetitions ?? 0;
  let interval = card.interval ?? 0;

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 6;
    } else {
      interval = Math.round((interval || 1) * ef);
    }
    reps += 1;
  }

  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const due = new Date(now);
  due.setDate(due.getDate() + interval);

  return {
    ...card,
    repetitions: reps,
    interval,
    easeFactor: ef,
    lastReviewedAt: now.toISOString(),
    dueAt: due.toISOString()
  };
}

/** Returns whether a card is due for review now */
export function isDue(card: Flashcard, now = new Date()): boolean {
  if (!card.dueAt) return true;
  return new Date(card.dueAt).getTime() <= now.getTime();
}