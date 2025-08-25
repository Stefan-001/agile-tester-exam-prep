import { Question, QuizResult } from './types';

/**
 * Given questions and past results, returns weights per question id where
 * incorrectly answered or low confidence questions get higher weight.
 */
export function computeQuestionWeights(questions: Question[], history: QuizResult[]) {
  const weights = new Map<string, number>();
  const byQ = new Map<string, QuizResult[]>();
  for (const r of history) {
    if (!byQ.has(r.questionId)) byQ.set(r.questionId, []);
    byQ.get(r.questionId)!.push(r);
  }
  for (const q of questions) {
    const attempts = byQ.get(q.id) || [];
    const incorrect = attempts.filter((a) => !a.correct).length;
    const lowConf = attempts.filter((a) => a.confidence === 'low').length;
    const base = 1;
    const weight = base + incorrect * 3 + lowConf * 1.5 + (q.difficulty === 'hard' ? 1 : 0);
    weights.set(q.id, weight);
  }
  return weights;
}

/** Weighted random selection from a set of questions. */
export function pickWeighted(questions: Question[], weights: Map<string, number>, count: number) {
  const items = questions.map((q) => ({ q, w: weights.get(q.id) ?? 1 }));
  const total = items.reduce((s, x) => s + x.w, 0);
  const selected: Question[] = [];
  const used = new Set<string>();
  while (selected.length < count && used.size < items.length) {
    let r = Math.random() * total;
    for (const item of items) {
      if (used.has(item.q.id)) continue;
      if ((r -= item.w) <= 0) {
        selected.push(item.q);
        used.add(item.q.id);
        break;
      }
    }
  }
  return selected;
}