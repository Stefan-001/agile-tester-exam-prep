import { useEffect, useMemo, useState } from 'react';
import { parseSyllabus } from '@/lib/parser';
import { Question, QuizResult } from '@/lib/types';
import QuizCard from '@/components/QuizCard';
import { saveResult } from '@/lib/db';
import { getCurrentLocalUser } from '@/lib/auth';

const EXAM_MINUTES = 30;

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selected: number[]; correct: boolean; confidence: 'low' | 'medium' | 'high' }>>({});
  const [endAt, setEndAt] = useState<number>(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    parseSyllabus().then(({ questions }) => {
      const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 40); // pick 40
      setQuestions(shuffled);
      setEndAt(Date.now() + EXAM_MINUTES * 60 * 1000);
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (!endAt) return;
      if (Date.now() >= endAt && !finished) {
        setFinished(true);
      }
    }, 500);
    return () => clearInterval(t);
  }, [endAt, finished]);

  const timeLeft = Math.max(0, endAt ? endAt - Date.now() : EXAM_MINUTES * 60 * 1000);
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  async function onSubmit(selected: number[], correct: boolean, confidence: 'low' | 'medium' | 'high') {
    setAnswers((a) => ({ ...a, [questions[index].id]: { selected, correct, confidence } }));
  }

  async function finish() {
    setFinished(true);
    const user = getCurrentLocalUser();
    const resList: QuizResult[] = Object.entries(answers).map(([qid, v]) => ({
      id: crypto.randomUUID(),
      userId: user?.id || 'anon',
      createdAt: new Date().toISOString(),
      questionId: qid,
      correct: v.correct,
      selected: v.selected,
      confidence: v.confidence
    }));
    for (const r of resList) await saveResult(r.userId, r);
  }

  const score = useMemo(() => {
    const vals = Object.values(answers);
    const correct = vals.filter((v) => v.correct).length;
    const total = vals.length || 1;
    return Math.round((correct / total) * 100);
  }, [answers]);

  useEffect(() => {
    if (finished) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exam Simulator</h1>
        <div className="rounded bg-gray-100 px-3 py-1 font-mono dark:bg-gray-800">
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>
      </div>
      {!finished ? (
        questions[index] ? (
          <>
            <QuizCard
              question={questions[index]}
              onSubmit={(s, c, conf) => {
                onSubmit(s, c, conf);
                setTimeout(() => {
                  setIndex((i) => Math.min(i + 1, questions.length - 1));
                }, 400);
              }}
            />
            <div className="flex items-center justify-between">
              <div>
                Question {index + 1} / {questions.length}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
                  Previous
                </button>
                {index < questions.length - 1 ? (
                  <button className="btn btn-primary" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}>
                    Next
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setFinished(true)}>
                    Submit Exam
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="card">Loading exam...</div>
        )
      ) : (
        <div className="card">
          <h2 className="mb-2 text-xl font-semibold">Results</h2>
          <p className="mb-2">
            Score: <span className="font-bold">{score}%</span>
          </p>
          <p className="mb-4">Status: {score >= 65 ? 'Pass' : 'Fail'}</p>
          <details>
            <summary className="cursor-pointer">Breakdown by question</summary>
            <ul className="ml-5 list-disc">
              {Object.entries(answers).map(([qid, v]) => (
                <li key={qid}>
                  {qid} - {v.correct ? 'Correct' : 'Incorrect'} (conf: {v.confidence})
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}