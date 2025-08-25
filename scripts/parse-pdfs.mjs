import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const docsDir = path.resolve('Documents');
const dataDir = path.resolve('data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function extractTopicsAndItems(text) {
  // Very simple heuristic parser; adjust as needed for your syllabus formatting
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const topics = [];
  let current = { id: 't0', title: 'General', terms: [], questions: [] };
  let topicIndex = 0;

  for (const line of lines) {
    if (/^(chapter|section|\d+\.)/i.test(line)) {
      if (current.terms.length || current.questions.length || current.title !== 'General') {
        topics.push(current);
      }
      topicIndex += 1;
      current = { id: `t${topicIndex}`, title: line.replace(/^\d+\.\s*/, ''), terms: [], questions: [] };
    } else {
      // Create simple flashcards from colon lines or definition-like sentences
      if (line.includes(':')) {
        const [term, ...rest] = line.split(':');
        const def = rest.join(':').trim();
        if (term && def && term.length < 120) {
          current.terms.push({ term: term.trim(), definition: def });
        }
      }
      // Create naive MCQ scaffolding by turning declarative sentences into Q/A
      if (/[.!?]$/.test(line) && line.split(' ').length > 6) {
        const stem = `Which of the following best reflects: "${line.slice(0, 120)}"`;
        const options = [
          { id: 'A', text: line, correct: true, explanation: 'Directly derived from syllabus sentence.' },
          { id: 'B', text: 'A related but incorrect statement.', correct: false, explanation: 'Distractor.' },
          { id: 'C', text: 'Another plausible but incorrect statement.', correct: false, explanation: 'Distractor.' },
          { id: 'D', text: 'An opposite or edge-case statement.', correct: false, explanation: 'Distractor.' }
        ];
        current.questions.push({ stem, options, multi: false, topicId: current.id });
      }
    }
  }
  if (current.terms.length || current.questions.length || current.title !== 'General') {
    topics.push(current);
  }
  return topics;
}

async function run() {
  const pdfs = fs.existsSync(docsDir) ? fs.readdirSync(docsDir).filter(f => f.toLowerCase().endsWith('.pdf')) : [];
  const index = [];
  const allTopics = [];
  for (const pdf of pdfs) {
    const filePath = path.join(docsDir, pdf);
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const topics = extractTopicsAndItems(data.text);
    const outName = pdf.replace(/\.pdf$/i, '.json');
    const outPath = path.join(dataDir, outName);
    fs.writeFileSync(outPath, JSON.stringify({ source: pdf, topics }, null, 2));
    index.push({ file: outName, source: pdf, topics: topics.map(t => ({ id: t.id, title: t.title })) });
    allTopics.push(...topics);
  }

  // Write index and combined topics
  fs.writeFileSync(path.join(dataDir, 'index.json'), JSON.stringify({ files: index }, null, 2));
  fs.writeFileSync(path.join(dataDir, 'all-topics.json'), JSON.stringify({ topics: allTopics }, null, 2));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});