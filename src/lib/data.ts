const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export type Term = { term: string; definition: string };
export type Option = { id: string; text: string; correct: boolean; explanation?: string };
export type Question = { stem: string; options: Option[]; multi?: boolean; topicId?: string };
export type Topic = { id: string; title: string; terms: Term[]; questions: Question[] };

export async function fetchAllTopics(): Promise<Topic[]> {
  try {
    const res = await fetch(`${base}/data/all-topics.json`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.topics || [];
  } catch {
    return [];
  }
}