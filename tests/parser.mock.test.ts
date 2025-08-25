import { parseSyllabus } from '@/lib/parser';

describe('Parser with mocks', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch as any;
    jest.restoreAllMocks();
  });

  test('loads data/index.json when available', async () => {
    const mkJson = (obj: any) => ({ ok: true, status: 200, json: async () => obj } as any);
    const notFound = { ok: false, status: 404, json: async () => ({}), text: async () => '' } as any;
    global.fetch = jest.fn(async (url: any) => {
      const href = typeof url === 'string' ? url : url.toString();
      if (href.includes('/data/index.json')) {
        return mkJson({
          topics: [{ id: 't1', name: 'Topic 1' }],
          questions: [{ id: 'q1', topicId: 't1', prompt: 'P?', options: ['A','B','C','D'], correct: [0], multiCorrect: false, explanation: '' }],
          flashcards: [{ id: 'c1', topicId: 't1', term: 'Term', definition: 'Def' }]
        });
      }
      return notFound;
    }) as any;

  const res = await parseSyllabus();
  expect(res.topics.length).toBe(1);
  // ensureMin in parser pads to >=50
  expect(res.questions.length).toBeGreaterThanOrEqual(50);
  expect(res.flashcards.length).toBeGreaterThanOrEqual(50);
  });

  test('falls back to markdown in /Documents when JSON not found', async () => {
    const md = `# Agile Principles\n\n## Terms\n- Iteration: A timeboxed period\n\n## Sample Questions\nQ: What is Agile?\n- A) Fast\n- B) A mindset\n- C) A tool\n- D) A language\nCorrect: B\n`;
    const mkText = (s: string) => ({ ok: true, status: 200, text: async () => s } as any);
    const notFound = { ok: false, status: 404, json: async () => ({}), text: async () => '' } as any;
    global.fetch = jest.fn(async (url: any) => {
      const href = typeof url === 'string' ? url : url.toString();
      if (href.includes('/data/index.json')) {
        return notFound;
      }
      if (href.includes('/Documents/sample-syllabus.md')) {
        return mkText(md);
      }
      return notFound;
    }) as any;

    const res = await parseSyllabus();
    expect(res.topics.length).toBeGreaterThan(0);
    expect(res.flashcards.length).toBeGreaterThan(0);
    expect(res.questions.length).toBeGreaterThan(0);
  });
});
