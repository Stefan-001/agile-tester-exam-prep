import { Question } from '@/lib/types';
import { useState } from 'react';
import { gradeQuestion } from '@/lib/quizEngine';
import ConfidenceMeter from './ConfidenceMeter';
import classNames from 'classnames';

type Props = {
  question: Question;
  onSubmit: (selected: number[], correct: boolean, confidence: 'low' | 'medium' | 'high') => void;
};

export default function QuizCard({ question, onSubmit }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  function toggleOption(idx: number) {
    setSelected((prev) => {
      if (question.multiCorrect) {
        return prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      } else {
        return prev.includes(idx) ? [] : [idx];
      }
    });
  }

  function handleSubmit() {
    const correct = gradeQuestion(question, selected);
    setIsCorrect(correct);
    setRevealed(true);
    onSubmit(selected, correct, confidence);
  }

  return (
    <div className="card w-full">
      <div className="mb-2 text-sm text-gray-500">Topic: {question.topicId}</div>
      <h2 className="mb-4 text-lg font-semibold">{question.prompt}</h2>
      <div role="group" aria-label="Options" className="space-y-2">
        {question.options.map((opt, i) => {
          const isCorrectOption = revealed && question.correct.includes(i);
          const chosen = selected.includes(i);
          return (
            <button
              key={i}
              onClick={() => toggleOption(i)}
              className={classNames(
                'w-full rounded border p-3 text-left transition',
                chosen ? 'border-brand ring-2 ring-brand' : 'border-gray-300 dark:border-gray-700',
                revealed && (isCorrectOption ? 'bg-green-100 dark:bg-green-900/30' : chosen ? 'bg-red-100 dark:bg-red-900/30' : '')
              )}
              aria-pressed={chosen}
            >
              <span className="mr-2 font-semibold">{String.fromCharCode(65 + i)})</span> {opt}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <ConfidenceMeter value={confidence} onChange={setConfidence} />
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={selected.length === 0}>
          Submit
        </button>
        {revealed && (
          <div className={classNames('rounded px-3 py-2 text-sm', isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200')}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </div>
        )}
      </div>
      {revealed && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Explanation</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{question.explanation}</p>
          {question.optionExplanations?.length ? (
            <ul className="ml-5 list-disc text-sm">
              {question.optionExplanations.map((exp, i) => (
                <li key={i}>
                  {exp}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}