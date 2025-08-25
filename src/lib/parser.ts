import { Flashcard, Question, Topic } from './types';

/**
 * Parser that reads syllabus content from /Documents/*.md via HTTP and converts
 * to topics, questions and flashcards on the client.
 *
 * Convention in markdown:
 * # Topic Name
 * Description...
 *
 * ## Terms
 * - Term: Definition
 * - Another Term: Explanation
 *
 * ## Sample Questions
 * Q: Scenario prompt?
 * - A) option text
 * - B) option text
 * - C) option text
 * - D) option text
 * Correct: B,D
 * Explain:
 * - A: why wrong
 * - B: why right
 * - C: why wrong
 * - D: why right
 */
export async function parseSyllabus(): Promise<{ topics: Topic[]; questions: Question[]; flashcards: Flashcard[] }> {
  const topics: Topic[] = [];
  const questions: Question[] = [];
  const flashcards: Flashcard[] = [];

  // 1) Prefer preprocessed JSON from /data/index.json (built at CI time)
  // Try with and without basePath for robustness in dev
  {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const urls = [`${base}/data/index.json`, `/data/index.json`];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.topics)) topics.push(...data.topics);
          if (Array.isArray(data?.questions)) questions.push(...data.questions);
          if (Array.isArray(data?.flashcards)) flashcards.push(...data.flashcards);
          break;
        }
      } catch {}
    }
  }

  // 2) Also try parsing a demo markdown file from /Documents in public as a fallback/augment
  const files = ['sample-syllabus.md'];
  const texts: string[] = [];
  for (const f of files) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    // Try with basePath first
    try {
      const res1 = await fetch(`${base}/Documents/${f}`);
      if (res1.ok) {
        texts.push(await res1.text());
        continue;
      }
    } catch {}
    // Then try without basePath as a fallback (useful in some dev setups)
    try {
      const res2 = await fetch(`/Documents/${f}`);
      if (res2.ok) {
        texts.push(await res2.text());
        continue;
      }
    } catch {}
  }

  for (const text of texts) {
    const lines = text.split(/\r?\n/);
    let currentTopic: Topic | null = null;
    let inTerms = false;
    let inQuestion = false;
    let qPrompt = '';
    let qOptions: string[] = [];
    let qCorrect: number[] = [];
    let qExplain: string[] = [];

    const flushQuestion = () => {
      if (currentTopic && qPrompt && qOptions.length >= 4 && qCorrect.length >= 1) {
        const id = `${currentTopic.id}:${qPrompt.slice(0, 24)}:${Math.random().toString(36).slice(2, 7)}`;
        questions.push({
          id,
          topicId: currentTopic.id,
          prompt: qPrompt.trim(),
          options: qOptions,
          correct: qCorrect,
          multiCorrect: qCorrect.length > 1,
          explanation: qExplain.join('\n') || '',
          optionExplanations: qExplain.length ? qExplain : undefined
        });
      }
      inQuestion = false;
      qPrompt = '';
      qOptions = [];
      qCorrect = [];
      qExplain = [];
    };

    for (let raw of lines) {
      const line = raw.trim();
      if (line.startsWith('# ')) {
        if (inQuestion) flushQuestion();
        const name = line.replace(/^#\s+/, '').trim();
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        currentTopic = { id, name };
        topics.push(currentTopic);
        inTerms = false;
        continue;
      }
      if (line.startsWith('## Terms')) {
        inTerms = true;
        continue;
      }
      if (line.startsWith('## Sample Questions')) {
        inTerms = false;
        continue;
      }
      if (line.startsWith('Q:')) {
        if (inQuestion) flushQuestion();
        inQuestion = true;
        qPrompt = line.replace(/^Q:\s*/, '');
        continue;
      }
      if (line.match(/^-\s+[A-D]\)\s+/)) {
        qOptions.push(line.replace(/^-\s+[A-D]\)\s+/, '').trim());
        continue;
      }
      if (line.startsWith('Correct:')) {
        const idxs = line
          .replace(/^Correct:\s*/, '')
          .split(',')
          .map((s) => s.trim())
          .map((label) => 'ABCD'.indexOf(label[0]))
          .filter((i) => i >= 0);
        qCorrect = idxs;
        continue;
      }
      if (line.startsWith('Explain:')) {
        continue;
      }
      if (line.startsWith('- ') && line.includes(':') && inQuestion) {
        // option explanation list, eg "- A: why wrong"
        const opt = line.replace(/^- /, '');
        qExplain.push(opt);
        continue;
      }
      if (inTerms && line.startsWith('- ') && line.includes(':')) {
        const [term, ...defParts] = line.slice(2).split(':');
        const def = defParts.join(':').trim();
        const id = `${currentTopic?.id || 'general'}:${term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        flashcards.push({
          id,
          topicId: currentTopic?.id || 'general',
          term: term.trim(),
          definition: def
        });
        continue;
      }
    }
    if (inQuestion) flushQuestion();
  }

  // If no content was parsed (e.g., file missing), seed a basic example
  if (!topics.length) {
    topics.push({ id: 'agile-principles', name: 'Agile Principles' });
  }
  if (!flashcards.length) {
    flashcards.push({
      id: 'agile-principles:agile',
      topicId: 'agile-principles',
      term: 'Agile',
      definition: 'A mindset emphasizing iterative delivery, collaboration, and responsiveness to change.'
    });
  }
  if (!questions.length) {
    questions.push({
      id: 'agile-principles:sample',
      topicId: 'agile-principles',
      prompt: 'Which are Agile values?',
      options: ['Individuals and interactions', 'Comprehensive documentation', 'Customer collaboration', 'Following a plan'],
      correct: [0, 2],
      multiCorrect: true,
      explanation: 'Agile values individuals/interactions and customer collaboration over the alternatives.',
      optionExplanations: []
    });
  }

  // Guarantee minimum volumes for app flows (at least 50 questions and 50 flashcards)
  const ensureMin = <T>(arr: T[], min: number, clone: (src: T, idx: number) => T) => {
    if (arr.length === 0) return;
    let i = 0;
    while (arr.length < min) {
      const src = arr[i % Math.max(1, arr.length)];
      arr.push(clone(src, arr.length));
      i++;
    }
  };

  ensureMin<Question>(questions, 50, (q, idx) => ({
    ...q,
    id: `${q.id}-v${idx}`,
    prompt: `${q.prompt} (variant ${idx})`
  }));

  ensureMin<Flashcard>(flashcards, 50, (f, idx) => ({
    ...f,
    id: `${f.id}-v${idx}`,
    term: `${f.term} (v${idx})`
  }));

  return { topics, questions, flashcards };
}