import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlashcardsPage from '../src/pages/flashcards';
import * as parser from '@/lib/parser';

describe('Flashcards deduplication', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not display duplicate flashcards with the same term (case/variant-insensitive)', async () => {
    jest.spyOn(parser, 'parseSyllabus').mockResolvedValue({
      topics: [],
      questions: [],
      flashcards: [
        { id: 'f1', topicId: 't', term: 'Agile', definition: 'd1' },
        { id: 'f2', topicId: 't', term: 'Agile (v1)', definition: 'd2' },
        { id: 'f3', topicId: 't', term: 'AGILE', definition: 'd3' },
        { id: 'f4', topicId: 't', term: 'Scrum', definition: 'd4' }
      ]
    });

    render(<FlashcardsPage />);

    // Wait for deck to be built (2 cards after dedupe)
    await screen.findByText(/Card 1 of 2/i);

  // Collect two visible terms across a single pass (deck size should be 2)
  const seen = new Set<string>();
  const term1 = screen.getByText(/agile|scrum/i).textContent as string;
  if (term1) seen.add(term1.toLowerCase());
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
  const term2 = screen.getByText(/agile|scrum/i).textContent as string;
  if (term2) seen.add(term2.toLowerCase());
  // Expect exactly two unique terms: agile and scrum
  expect(seen.size).toBe(2);
  expect(Array.from(seen).some((t) => /agile/i.test(t))).toBe(true);
  expect(Array.from(seen).some((t) => /scrum/i.test(t))).toBe(true);
  });
});
