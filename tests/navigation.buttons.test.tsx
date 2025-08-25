import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizPage from '../src/pages/quiz';
import FlashcardsPage from '../src/pages/flashcards';

// Mock parser to control data
jest.mock('@/lib/parser', () => ({
  parseSyllabus: async () => ({
    topics: [{ id: 't', name: 'T' }],
    questions: Array.from({ length: 50 }).map((_, i) => ({
      id: `q${i}`,
      topicId: 't',
      prompt: `P ${i}`,
      options: ['a','b','c','d'],
      correct: [0],
      multiCorrect: false,
      explanation: ''
    })),
    flashcards: Array.from({ length: 50 }).map((_, i) => ({ id: `f${i}`, topicId: 't', term: `T${i}`, definition: `D${i}` }))
  })
}));

jest.mock('@/lib/db', () => ({ saveResult: async () => {} }));
jest.mock('@/lib/auth', () => ({ getCurrentLocalUser: () => ({ id: 'u1' }) }));

it('has Previous/Next on Quiz and increments index', async () => {
  render(<QuizPage />);
  expect(await screen.findByText('Quiz')).toBeInTheDocument();
  // select first option and submit, then Next should be enabled
  const firstOption = await screen.findByRole('button', { name: /^A\)/i });
  fireEvent.click(firstOption);
  const submit = await screen.findByRole('button', { name: /submit/i });
  fireEvent.click(submit);
  const nextButtons = await screen.findAllByRole('button', { name: /next/i });
  fireEvent.click(nextButtons[0]);
  // index text shows progress
  expect(await screen.findByText(/Question 2 of/)).toBeInTheDocument();
});

it('has Previous/Next on Flashcards and increments index', async () => {
  render(<FlashcardsPage />);
  expect(await screen.findByText('Flashcards')).toBeInTheDocument();
  const next = await screen.findByRole('button', { name: /next/i });
  fireEvent.click(next);
  expect(await screen.findByText(/Card 2 of/)).toBeInTheDocument();
});
