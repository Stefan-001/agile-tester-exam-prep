'use client';
import { useEffect, useState } from 'react';
import { fetchAllTopics, type Topic } from '../../lib/data';
import { generateQuiz, grade, type QuizItem } from '../../lib/quiz';
import { QuizQuestion } from '../../components/QuizQuestion';
import { Timer } from '../../components/Timer';

export default function ExamPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => { (async () => setTopics(await fetchAllTopics()))(); }, []);
  useEffect(() => { if (topics.length) setQuiz(generateQuiz(topics, 40)); }, [topics]);

  const submit = () => { const r = grade(answers, quiz); setDone(true); setResult(r); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Exam Simulation</h1>
      {!done && <Timer seconds={60 * 60} onElapsed={submit} />}
      {quiz.map(q => <QuizQuestion key={q.id} q={q} selected={answers[q.id] || []} onChange={(id, sel) => setAnswers(a => ({ ...a, [id]: sel }))} />)}
      {!done && <button className="px-3 py-1 border rounded" onClick={submit}>Submit</button>}
      {done && <div className="text-lg font-semibold">Result: {result.scorePct}% — {result.scorePct >= 65 ? 'Pass' : 'Fail'}</div>}
    </div>
  );
}