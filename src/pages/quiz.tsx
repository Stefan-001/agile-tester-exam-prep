import { useEffect, useMemo, useState } from 'react';
import { parseSyllabus } from '@/lib/parser';
import { Question, QuizResult } from '@/lib/types';
import QuizCard from '@/components/QuizCard';
import { computeQuestionWeights, pickWeighted } from '@/lib/adaptiveLearning';
import { saveResult } from '@/lib/db';
import { getCurrentLocalUser } from '@/lib/auth';

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [adaptive, setAdaptive] = useState(true);

  useEffect(() => {
    parseSyllabus().then(({ questions }) => {
      setQuestions(questions);
      setQueue(questions.slice(0, 10));
    });
  }, []);

  const current = queue[index];

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
      id: crypto.randomUUID(),
      userId: user?.id || 'anon',
      createdAt: new Date().toISOString(),
      questionId: current.id,
      correct,
      selected,
      confidence
    };
    setHistory((h) => [...h, result]);
    await saveResult(result.userId, result);
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
            question={current}
            onSubmit={(s, c, conf) => {
              onSubmit(s, c, conf);
              setTimeout(() => {
                setIndex((i) => (i + 1) % queue.length);
              }, 500);
            }}
          />
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