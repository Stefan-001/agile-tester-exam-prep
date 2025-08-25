import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizPage from '../src/pages/quiz';
import FlashcardsPage from '../src/pages/flashcards';
import ExamPage from '../src/pages/exam';

jest.mock('@/lib/parser', () => ({
  parseSyllabus: async () => ({
    topics: [{ id: 't', name: 'T' }],
    questions: Array.from({ length: 60 }).map((_, i) => ({
      id: `q${i}`,
      topicId: 't',
      prompt: `P ${i}`,
      options: ['a','b','c','d'],
      correct: [0],
      multiCorrect: false,
      explanation: ''
    })),
    flashcards: Array.from({ length: 60 }).map((_, i) => ({ id: `f${i}`, topicId: 't', term: `T${i}`, definition: `D${i}` }))
  })
}));

jest.mock('@/lib/db', () => ({ saveResult: async () => {}, loadResults: async () => [] }));
jest.mock('@/lib/auth', () => ({ getCurrentLocalUser: () => ({ id: 'u1' }) }));

it('smoke: quiz page loads and Next works', async () => {
  render(<QuizPage />);
  expect(await screen.findByText('Quiz')).toBeInTheDocument();
  const firstOption = await screen.findByRole('button', { name: /^A\)/i });
  fireEvent.click(firstOption);
  const submit = await screen.findByRole('button', { name: /submit/i });
  fireEvent.click(submit);
  const btns = await screen.findAllByRole('button', { name: /next/i });
  fireEvent.click(btns[0]);
  expect(await screen.findByText(/Question 2 of/)).toBeInTheDocument();
});

it('smoke: flashcards page loads and Next works', async () => {
  render(<FlashcardsPage />);
  expect(await screen.findByText('Flashcards')).toBeInTheDocument();
  const next = await screen.findByRole('button', { name: /next/i });
  fireEvent.click(next);
  expect(await screen.findByText(/Card 2 of/)).toBeInTheDocument();
});

it('smoke: exam page loads 50 questions and Next works', async () => {
  render(<ExamPage />);
  expect(await screen.findByText('Exam Simulator')).toBeInTheDocument();
  // may have two Next buttons (card and page control); click first occurrence
  const btns = await screen.findAllByRole('button', { name: /next/i });
  fireEvent.click(btns[0]);
  // Progress text exists; hard to assert count without exposing length; this checks navigation
  expect(await screen.findByText(/Question 2 \/ 50/)).toBeInTheDocument();
});
