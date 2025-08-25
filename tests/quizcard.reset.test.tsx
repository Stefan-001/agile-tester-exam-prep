import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizCard from '@/components/QuizCard';
import { Question } from '@/lib/types';

const makeQ = (id: string, prompt: string): Question => ({
  id,
  topicId: 't1',
  prompt,
  options: ['A1', 'B1', 'C1', 'D1'],
  correct: [0],
  multiCorrect: false,
  explanation: ''
});

describe('QuizCard selection reset', () => {
  it('clears selected answers when moving to a new question', async () => {
    const q1 = makeQ('q1', 'First?');
    const q2 = makeQ('q2', 'Second?');

    const { rerender } = render(<QuizCard question={q1} onSubmit={() => {}} />);

    // Select option A
    const optA1 = screen.getByRole('button', { name: /^A\)/ });
  fireEvent.click(optA1);

    // Submit should now be enabled
    const submit1 = screen.getByRole('button', { name: /submit/i });
    expect(submit1).not.toHaveAttribute('disabled');

    // Move to next question (simulate parent prop change)
    rerender(<QuizCard question={q2} onSubmit={() => {}} />);

    // Submit should be disabled again; no options selected
    const submit2 = screen.getByRole('button', { name: /submit/i });
    expect(submit2).toHaveAttribute('disabled');

    // Ensure no option is marked pressed
  // Query all option buttons by role via the Options group container
  const optionsGroup = screen.getByRole('group', { name: /options/i });
  const options = optionsGroup.querySelectorAll('button');
  expect(options.length).toBe(4);
  options.forEach((btn) => expect(btn).toHaveAttribute('aria-pressed', 'false'));
  });
});
