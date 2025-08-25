import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ExamPage from '../src/pages/exam';

jest.mock('@/lib/db', () => ({ saveResult: async () => {} }));
jest.mock('@/lib/auth', () => ({ getCurrentLocalUser: () => ({ id: 'u1' }) }));

// Shared mock data object to avoid reloading React modules
const mockData = { topics: [{ id: 't', name: 'T' }], questions: [] as any[], flashcards: [] as any[] };
jest.mock('@/lib/parser', () => ({ parseSyllabus: async () => mockData }));

describe('Exam submission flow and scoring', () => {
  beforeEach(() => {
    mockData.questions = [];
  });

  it('shows Fail with <65% score after submitting exam', async () => {
    mockData.questions = [0, 1].map((i) => ({
      id: `q${i}`,
      topicId: 't',
      prompt: `P ${i}`,
      options: ['a', 'b', 'c', 'd'],
      correct: [0],
      multiCorrect: false,
      explanation: ''
    }));

    render(<ExamPage />);

    expect(await screen.findByText('Exam Simulator')).toBeInTheDocument();

    // Q1: choose wrong (B)
    fireEvent.click(await screen.findByRole('button', { name: /^b\)/i }));
  fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
  fireEvent.click((await screen.findAllByRole('button', { name: /^next$/i }))[0]);

    // Q2: choose wrong (B)
  fireEvent.click(await screen.findByRole('button', { name: /^b\)/i }));
  fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    // Submit exam
    fireEvent.click(screen.getByRole('button', { name: /submit exam/i }));

  expect(await screen.findByText('Results')).toBeInTheDocument();
  expect(screen.getByText(/Status:/)).toBeInTheDocument();
  expect(screen.getByText(/Fail/)).toBeInTheDocument();
  });

  it('shows Pass when most answers are correct', async () => {
    // Use 2 questions for deterministic pass (100%)
    mockData.questions = [0, 1].map((i) => ({
      id: `q${i}`,
      topicId: 't',
      prompt: `P ${i}`,
      options: ['a', 'b', 'c', 'd'],
      correct: [0],
      multiCorrect: false,
      explanation: ''
    }));

    render(<ExamPage />);

    expect(await screen.findByText('Exam Simulator')).toBeInTheDocument();

    // Q1 correct (A)
  fireEvent.click(await screen.findByRole('button', { name: /^a\)/i }));
  fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
  fireEvent.click((await screen.findAllByRole('button', { name: /^next$/i }))[0]);

  // Q2 correct (A)
  fireEvent.click(await screen.findByRole('button', { name: /^a\)/i }));
  fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    // Submit exam
    fireEvent.click(screen.getByRole('button', { name: /submit exam/i }));

  expect(await screen.findByText('Results')).toBeInTheDocument();
  expect(screen.getByText(/Status:/)).toBeInTheDocument();
  expect(screen.getByText(/Pass/)).toBeInTheDocument();
  });
});
