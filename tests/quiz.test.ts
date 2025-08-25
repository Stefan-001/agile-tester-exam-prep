import { generateQuiz, grade } from '../src/lib/quiz';

test('grade all correct', () => {
  const quiz = [{
    id: 'q1',
    stem: 'Question?',
    options: [
      { id: 'A', text: 'a', correct: true },
      { id: 'B', text: 'b', correct: false }
    ]
  }];
  const res = grade({ q1: ['A'] }, quiz as any);
  expect(res.correct).toBe(1);
  expect(res.scorePct).toBe(100);
});