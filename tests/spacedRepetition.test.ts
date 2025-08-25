import { scheduleSM2, isDue } from '@/lib/spacedRepetition';

describe('SM-2 scheduling', () => {
  test('low quality resets repetitions', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const card = { id: '1', topicId: 't', term: 'x', definition: 'y', repetitions: 3, interval: 10, easeFactor: 2.5 };
    const updated = scheduleSM2(card, 2, now);
    expect(updated.repetitions).toBe(0);
    expect(updated.interval).toBe(1);
  });

  test('high quality increases interval', () => {
    const now = new Date('2024-01-01T00:00:00Z');
    const card = { id: '1', topicId: 't', term: 'x', definition: 'y', repetitions: 2, interval: 6, easeFactor: 2.5 };
    const updated = scheduleSM2(card, 5, now);
    expect(updated.interval).toBeGreaterThanOrEqual(15);
    expect(isDue(updated, new Date('2024-01-10T00:00:00Z'))).toBe(false);
  });
});