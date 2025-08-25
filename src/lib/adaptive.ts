import type { Topic } from './data';
import type { QuizItem } from './quiz';

// Track accuracy per topic; reinforce weak areas first
export type TopicStats = Record<string, { correct: number; total: number }>;

export function nextAdaptiveBatch(topics: Topic[], stats: TopicStats, size = 10): QuizItem[] {
  const withScore = topics.map(t => {
    const s = stats[t.id] || { correct: 0, total: 0 };
    const acc = s.total ? s.correct / s.total : 0;
    return { topic: t, acc };
  });
  withScore.sort((a, b) => a.acc - b.acc); // weakest first
  const orderedQuestions = withScore.flatMap(w => w.topic.questions.map((q, i) => ({ ...q, id: `${w.topic.id}-${i}` })));
  return orderedQuestions.slice(0, size);
}