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
  const files = ['sample-syllabus.md']; // Could be discovered via an index in future
  const texts = await Promise.all(
    files.map(async (f) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/Documents/${f}`);
      if (!res.ok) throw new Error(`Failed to load ${f}`);
      return res.text();
    })
  );

  const topics: Topic[] = [];
  const questions: Question[] = [];
  const flashcards: Flashcard[] = [];

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

  // If no content was parsed (shouldn't happen with sample), seed a basic example
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

  return { topics, questions, flashcards };
}