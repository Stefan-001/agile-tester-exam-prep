import { parseSyllabus } from '@/lib/parser';

// Ensures we have minimum required volumes for quiz and flashcards

test('parser returns at least 50 questions and 50 flashcards', async () => {
  const { questions, flashcards } = await parseSyllabus();
  expect(questions.length).toBeGreaterThanOrEqual(50);
  expect(flashcards.length).toBeGreaterThanOrEqual(50);
});
