import { getSupabase } from './auth';
import { QuizResult, StudyProgress } from './types';

const LOCAL_RESULTS_KEY = 'agile:results';
const LOCAL_PROGRESS_KEY = 'agile:progress';

export async function saveResult(userId: string, result: QuizResult) {
  const supabase = getSupabase();
  if (supabase) {
    // Example table "results" with columns: id, user_id, created_at, question_id, correct, selected, confidence
    await supabase.from('results').insert({
      id: result.id,
      user_id: userId,
      created_at: result.createdAt,
      question_id: result.questionId,
      correct: result.correct,
      selected: result.selected,
      confidence: result.confidence
    });
  } else {
    const all = JSON.parse(localStorage.getItem(LOCAL_RESULTS_KEY) || '[]') as QuizResult[];
    all.push(result);
    localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(all));
  }
}

export async function loadResults(userId: string): Promise<QuizResult[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from('results').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    return (
      data?.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        createdAt: r.created_at,
        questionId: r.question_id,
        correct: r.correct,
        selected: r.selected,
        confidence: r.confidence
      })) || []
    );
  } else {
    return JSON.parse(localStorage.getItem(LOCAL_RESULTS_KEY) || '[]') as QuizResult[];
  }
}

export async function saveProgress(progress: StudyProgress) {
  const supabase = getSupabase();
  if (supabase) {
    // Example table "progress" with JSON columns: topic_mastery, badges
    await supabase
      .from('progress')
      .upsert({
        user_id: progress.userId,
        updated_at: progress.updatedAt,
        topic_mastery: progress.topicMastery,
        badges: progress.badges,
        streak_days: progress.streakDays
      })
      .eq('user_id', progress.userId);
  } else {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
  }
}

export async function loadProgress(userId: string): Promise<StudyProgress | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.from('progress').select('*').eq('user_id', userId).maybeSingle();
    if (!data) return null;
    return {
      userId: data.user_id,
      updatedAt: data.updated_at,
      topicMastery: data.topic_mastery || [],
      badges: data.badges || [],
      streakDays: data.streak_days || 0
    };
  } else {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as StudyProgress) : null;
  }
}