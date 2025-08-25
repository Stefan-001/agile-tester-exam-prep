import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizCard from '@/components/QuizCard';

const sample = {
  id: 'q1',
  topicId: 't1',
  prompt: 'Pick A',
  options: ['A', 'B', 'C', 'D'],
  correct: [0],
  multiCorrect: false,
  explanation: 'Because.'
};

test('shows Next button after submit and triggers onNext', async () => {
  const onSubmit = jest.fn();
  const onNext = jest.fn();
  render(<QuizCard question={sample as any} onSubmit={onSubmit} onNext={onNext} />);

  // select option A
  fireEvent.click(screen.getByRole('button', { name: /a\)/i }));
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));

  // Next button appears
  const next = await screen.findByRole('button', { name: /next/i });
  fireEvent.click(next);
  expect(onSubmit).toHaveBeenCalled();
  expect(onNext).toHaveBeenCalled();
});
