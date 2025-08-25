import { QuizResult } from './types';
import { getSupabase } from './auth';

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

/** Returns best session slices from results (local or Supabase). Each session = 10 answers bucket. */
export async function getBestSessions(userId: string): Promise<{ label: string; score: number; date: string }[]> {
  const supabase = getSupabase();
  let results: QuizResult[] = [];
  if (supabase) {
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    results = (data || []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      createdAt: r.created_at,
      questionId: r.question_id,
      correct: r.correct,
      selected: r.selected,
      confidence: r.confidence
    }));
  } else {
    results = JSON.parse(localStorage.getItem('agile:results') || '[]');
  }

  const chunk = 10;
  const sessions: { label: string; score: number; date: string }[] = [];
  for (let i = 0; i < results.length; i += chunk) {
    const slice = results.slice(i, i + chunk);
    if (!slice.length) continue;
    const score = Math.round((slice.filter((r) => r.correct).length / slice.length) * 100);
    sessions.push({ label: `Session ${Math.floor(i / chunk) + 1}`, score, date: slice[slice.length - 1].createdAt });
  }
  return sessions.sort((a, b) => b.score - a.score).slice(0, 10);
}