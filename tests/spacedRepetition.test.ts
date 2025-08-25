import { initCard, review } from '../src/lib/spacedRepetition';

test('review upgrades repetition for good quality', () => {
  const c = initCard('x', 0);
  const c2 = review(c, 5, 0);
  expect(c2.repetition).toBe(1);
  const c3 = review(c2, 5, 0);
  expect(c3.repetition).toBe(2);
});