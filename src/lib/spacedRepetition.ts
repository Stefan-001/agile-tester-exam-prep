export type CardState = {
  id: string;
  interval: number;
  repetition: number;
  ef: number;
  due: number;
};

export function review(state: CardState, quality: 0 | 1 | 2 | 3 | 4 | 5, now = Date.now()): CardState {
  let { ef, interval, repetition } = state;
  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * ef);
    repetition += 1;
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const due = now + interval * 24 * 60 * 60 * 1000;
  return { id: state.id, ef, interval, repetition, due };
}

export function initCard(id: string, now = Date.now()): CardState {
  return { id, ef: 2.5, interval: 0, repetition: 0, due: now };
}

export function pickDue(cards: CardState[], now = Date.now(), max = 20) {
  return cards.filter(c => c.due <= now).slice(0, max);
}