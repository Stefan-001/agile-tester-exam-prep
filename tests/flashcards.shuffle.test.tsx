import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FlashcardsPage from '../src/pages/flashcards';
import * as parser from '@/lib/parser';
import * as util from '@/lib/util';

const makeCard = (id: string, term: string) => ({
  id,
  topicId: 't1',
  term,
  definition: 'def'
});

describe('Flashcards shuffling', () => {
  const mockParse = jest.spyOn(parser, 'parseSyllabus');
  const cards = Array.from({ length: 5 }, (_, i) => makeCard(`c${i + 1}`, `T${i + 1}`));

  beforeEach(() => {
    mockParse.mockResolvedValue({ topics: [], questions: [], flashcards: cards });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('wrap: reshuffles to a different order after cycling all cards', async () => {
  const shuffleMock = jest.spyOn(util, 'shuffle');
  // Initial empty-deck shuffle
  shuffleMock.mockImplementationOnce((arr: readonly unknown[]) => [...arr]);
  // First real deck: identity order
  shuffleMock.mockImplementationOnce((arr: readonly unknown[]) => [...arr]);
  // Reshuffle after wrap: reverse order
  shuffleMock.mockImplementationOnce((arr: readonly unknown[]) => [...arr].reverse());

    render(<FlashcardsPage />);
    await screen.findByText(/flashcards/i);

    const getCurrentTerm = () => screen.getByText(/T\d+/).textContent as string;

    const seenFirstPass: string[] = [];
    for (let i = 0; i < 5; i++) {
      seenFirstPass.push(getCurrentTerm());
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    const seenSecondPass: string[] = [];
    for (let i = 0; i < 5; i++) {
      seenSecondPass.push(getCurrentTerm());
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    expect(seenFirstPass).toEqual(['T1', 'T2', 'T3', 'T4', 'T5']);
    expect(seenSecondPass).toEqual(['T5', 'T4', 'T3', 'T2', 'T1']);
  });

  it('refresh: new randomized starting order on page reload', async () => {
  const shuffleMock = jest.spyOn(util, 'shuffle');
  // First render: empty deck then identity
  shuffleMock.mockImplementationOnce((arr: readonly unknown[]) => [...arr]);
  shuffleMock.mockImplementationOnce((arr: readonly unknown[]) => [...arr]);
    render(<FlashcardsPage />);
    await screen.findByText(/flashcards/i);
    const firstStart = screen.getByText(/T\d+/).textContent;

    // Simulate page refresh by unmounting and rendering again
    cleanup();

  // Second render: empty deck then different order (rotate by 2)
  shuffleMock.mockImplementationOnce((arr: readonly unknown[]) => [...arr]);
  shuffleMock.mockImplementationOnce((arr: readonly unknown[]) => {
      const a = [...arr];
      return [...a.slice(2), ...a.slice(0, 2)];
    });
    render(<FlashcardsPage />);
    await screen.findByText(/flashcards/i);
    const secondStart = screen.getByText(/T\d+/).textContent;

    expect(firstStart).toBeDefined();
    expect(secondStart).toBeDefined();
    expect(secondStart).not.toEqual(firstStart);
  });
});
