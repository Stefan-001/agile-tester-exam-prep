'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchAllTopics, type Topic } from '../../lib/data';
import { generateQuiz, grade, type QuizItem } from '../../lib/quiz';
import { QuizQuestion } from '../../components/QuizQuestion';
import { ConfidenceMeter } from '../../components/ConfidenceMeter';
import { ReportExportButtons } from '../../components/ReportExportButtons';

export default function QuizPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [conf, setConf] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => { (async () => setTopics(await fetchAllTopics()))(); }, []);
  useEffect(() => { if (topics.length) setQuiz(generateQuiz(topics, 10)); }, [topics]);

  const onChange = (id: string, sel: string[]) => setAnswers(a => ({ ...a, [id]: sel }));
  const rows = useMemo(() => quiz.map(q => ({ question: q.stem, correct: result ? result.details.find((d: any) => d.id === q.id)?.correct : false })), [quiz, result]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Quiz</h1>
      {quiz.map(q => (
        <div key={q.id} className="space-y-2">
          <QuizQuestion q={q} selected={answers[q.id] || []} onChange={onChange} />
          <ConfidenceMeter value={conf[q.id] || 3} onChange={(v) => setConf(c => ({ ...c, [q.id]: v }))} />
        </div>
      ))}
      <div className="flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={() => setResult(grade(answers, quiz))}>Submit</button>
        {result && <div>Score: {result.scorePct}%</div>}
      </div>
      {result && <ReportExportButtons rows={rows} title="Quiz Results" />}
    </div>
  );
}