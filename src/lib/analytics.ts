import { QuizResult } from './types';

export function computeAccuracyByConfidence(results: QuizResult[]) {
  const buckets: Record<string, { correct: number; total: number }> = {
    low: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    high: { correct: 0, total: 0 }
  };
  for (const r of results) {
    buckets[r.confidence].total++;
    if (r.correct) buckets[r.confidence].correct++;
  }
  return ['low', 'medium', 'high'].map((k) => ({
    label: k,
    accuracy: buckets[k].total ? buckets[k].correct / buckets[k].total : 0
  }));
}

export function computeTopicHeatmap(results: QuizResult[]) {
  const byTopic: Record<string, { correct: number; total: number }> = {};
  for (const r of results) {
    // r.questionId is used as key; a real implementation would map to topicId.
    const topic = r.questionId.split(':')[0] || 'General';
    byTopic[topic] ||= { correct: 0, total: 0 };
    byTopic[topic].total++;
    if (r.correct) byTopic[topic].correct++;
  }
  return Object.entries(byTopic).map(([topic, { correct, total }]) => ({
    topic,
    accuracy: total ? correct / total : 0
  }));
}