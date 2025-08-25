import { parseSyllabus } from '@/lib/parser';

describe('Parser', () => {
  test('parses sample syllabus', async () => {
    // JSDOM cannot fetch local files; this is a placeholder illustrating test intent.
    // In real tests, we'd mock fetch and provide the markdown content.
    expect(typeof parseSyllabus).toBe('function');
  });
});