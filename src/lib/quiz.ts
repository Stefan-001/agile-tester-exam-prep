import type { Question, Topic } from './data';

export type QuizItem = Question & { id: string };

export function generateQuiz(topics: Topic[], count = 20): QuizItem[] {
  const questions = topics.flatMap(t => t.questions.map((q, i) => ({ ...q, id: `${t.id}-${i}` })));
  shuffle(questions);
  return questions.slice(0, count);
}

export function grade(answers: Record<string, string[]>, quiz: QuizItem[]) {
  let correct = 0;
  const details = quiz.map(q => {
    const chosen = new Set(answers[q.id] || []);
    const correctSet = new Set(q.options.filter(o => o.correct).map(o => o.id));
    const ok = eqSet(chosen, correctSet);
    if (ok) correct += 1;
    return { id: q.id, correct: ok, chosen: [...chosen], correctAnswers: [...correctSet] };
  });
  return { correct, total: quiz.length, details, scorePct: Math.round((correct / quiz.length) * 100) };
}

function shuffle<T>(a: T[]): void {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function eqSet(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}