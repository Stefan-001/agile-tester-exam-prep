import { review, initCard, pickDue } from '@/lib/spacedRepetition';

describe('Spaced repetition', () => {
  test('low quality resets repetitions', () => {
    const now = Date.now();
    const card = { id: '1', ef: 2.5, interval: 10, repetition: 3, due: now };
    const updated = review(card, 2, now);
    expect(updated.repetition).toBe(0);
    expect(updated.interval).toBe(1);
  });

  test('high quality increases interval', () => {
    const now = Date.now();
    const card = { id: '1', ef: 2.5, interval: 6, repetition: 2, due: now };
    const updated = review(card, 5, now);
    expect(updated.interval).toBeGreaterThanOrEqual(15);
  });

  test('initCard creates new card', () => {
    const card = initCard('test-id');
    expect(card.id).toBe('test-id');
    expect(card.ef).toBe(2.5);
    expect(card.repetition).toBe(0);
  });
});