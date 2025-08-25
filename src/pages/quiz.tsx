import { useEffect, useMemo, useState } from 'react';
import { parseSyllabus } from '@/lib/parser';
import { Question, QuizResult } from '@/lib/types';
import QuizCard from '@/components/QuizCard';
import { computeQuestionWeights, pickWeighted } from '@/lib/adaptiveLearning';
import { saveResult } from '@/lib/db';
import { getCurrentLocalUser } from '@/lib/auth';
import { safeUuid } from '@/lib/util';

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [adaptive, setAdaptive] = useState(true);
  const [canAdvance, setCanAdvance] = useState(false);

  useEffect(() => {
    parseSyllabus().then(({ questions }) => {
      const sample = questions.slice(0, Math.min(50, questions.length));
      setQuestions(sample);
      setQueue(sample.slice(0, Math.min(10, sample.length)));
    });
  }, []);

  const current = queue[index];

  // Reset advance permission whenever the current question changes
  useEffect(() => {
    if (current) setCanAdvance(false);
  }, [current?.id]);

  useEffect(() => {
    if (!adaptive || history.length < 3) return;
    const weights = computeQuestionWeights(questions, history);
    const picks = pickWeighted(questions, weights, 10);
    setQueue(picks);
    setIndex(0);
  }, [adaptive, history, questions]);

  async function onSubmit(selected: number[], correct: boolean, confidence: 'low' | 'medium' | 'high') {
    const user = getCurrentLocalUser();
    const result: QuizResult = {
  id: safeUuid(),
      userId: user?.id || 'anon',
      createdAt: new Date().toISOString(),
      questionId: current.id,
      correct,
      selected,
      confidence
    };
    setHistory((h) => [...h, result]);
    await saveResult(result.userId, result);
  setCanAdvance(true);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quiz</h1>
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={adaptive} onChange={(e) => setAdaptive(e.target.checked)} />
          <span>Adaptive mode</span>
        </label>
        <span className="text-sm text-gray-600 dark:text-gray-300">Reinforces weak areas more frequently</span>
      </div>
      {current ? (
        <>
      <QuizCard
            key={current.id}
            question={current}
            onSubmit={(s, c, conf) => {
              onSubmit(s, c, conf);
        // Do not auto-advance; require user to click Next or the in-card Next after reveal
            }}
            onNext={() => setIndex((i) => (i + 1) % queue.length)}
          />
          <div className="flex items-center justify-end gap-2">
            <button className="btn btn-secondary" onClick={() => setIndex((i) => (i - 1 + queue.length) % queue.length)} disabled={index === 0}>
              Previous
            </button>
            <button className="btn btn-primary" onClick={() => setIndex((i) => (i + 1) % queue.length)} disabled={!canAdvance}>
              Next
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Question {index + 1} of {queue.length}
          </div>
        </>
      ) : (
        <div className="card">Loading questions...</div>
      )}
    </div>
  );
}