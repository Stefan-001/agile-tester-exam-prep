#!/usr/bin/env node

/* Parses PDF syllabus documents into structured JSON for the app using pdfjs-dist */
import { promises as fs } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function extractTextFromPdf(filePath) {
  // Use the node build
  const data = new Uint8Array(await fs.readFile(filePath));
  // Point to standard fonts to avoid warnings in Node
  const standardFontDataUrl = new URL('../node_modules/pdfjs-dist/standard_fonts/', import.meta.url).toString();
  const loadingTask = pdfjsLib.getDocument({ data, standardFontDataUrl, disableFontFace: true });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => ('str' in item ? item.str : '')).filter(Boolean);
    pages.push({ page: pageNum, text: strings.join(' ') });
  }
  return pages;
}

function naiveParseToStructure(pages, pdfName) {
  // Heuristics to produce topics, flashcards, and questions from PDF text.
  // We get text per page; split each page into segments by multiple spaces to simulate breaks.
  const topics = [];
  const flashcards = [];
  const questions = [];
  let currentTopic = null;

  for (const { page, text } of pages) {
    const line = text.trim();
    // Topic detection on each page first
    if (/^(chapter|section)\s+\d+/i.test(line) || /^\d+\.\d+/.test(line)) {
      const name = line.replace(/^\d+\.\d+\s*/, '').replace(/^(Chapter|Section)\s+\d+\s*[:.-]?\s*/i, '').slice(0, 60) || 'Topic';
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      currentTopic = { id, name };
      if (!topics.find((t) => t.id === id)) topics.push(currentTopic);
    }

    const segments = line.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);
    // Scan segments for terms and questions
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // Topic heading in segment
      if (/^(chapter|section)\s+\d+/i.test(seg) || /^\d+\.\d+\s+/.test(seg)) {
        const name = seg.replace(/^\d+\.\d+\s*/, '').replace(/^(Chapter|Section)\s+\d+\s*[:.-]?\s*/i, '').slice(0, 60) || 'Topic';
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        currentTopic = { id, name };
        if (!topics.find((t) => t.id === id)) topics.push(currentTopic);
        continue;
      }

      // Term: Definition
      if (currentTopic && /[:–-]\s+/.test(seg)) {
        const [termPart, ...rest] = seg.split(/[:–-]\s+/);
        const term = termPart.trim();
        const definition = rest.join(': ').trim();
    if (term && definition && term.length <= 60 && definition.length >= 5) {
          const fid = `${currentTopic.id}:${term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          if (!flashcards.find((f) => f.id === fid)) {
      flashcards.push({ id: fid, topicId: currentTopic.id, term, definition, source: { pdf: pdfName, page, context: seg } });
            continue;
          }
        }
      }

      // Question with options following
      if (currentTopic && (/\?$/.test(seg) || /\b(example|for example|e\.g\.)\b/i.test(seg))) {
        const prompt = seg.slice(0, 200);
        const options = [];
        const pattern = /^(?:[A-D][\)\.]\s*)(.+)$/;
        for (let j = i + 1; j < Math.min(segments.length, i + 8); j++) {
          const m = segments[j].match(pattern);
          if (m) options.push(m[1].trim());
        }
    if (options.length >= 3) {
          const qid = `${currentTopic.id}:${Math.random().toString(36).slice(2, 8)}`;
          questions.push({
            id: qid,
            topicId: currentTopic.id,
            prompt,
            options: options.slice(0, 4),
            correct: [0],
            multiCorrect: false,
      explanation: 'Derived heuristically from syllabus content.',
      source: { pdf: pdfName, page, context: seg }
          });
          continue;
        } else {
          // Fallback True/False style
          const qid = `${currentTopic.id}:${Math.random().toString(36).slice(2, 8)}`;
          questions.push({
            id: qid,
            topicId: currentTopic.id,
            prompt,
            options: ['True', 'False', 'Not stated', 'Irrelevant'],
            correct: [0],
            multiCorrect: false,
      explanation: 'Derived heuristically from syllabus example statement.',
      source: { pdf: pdfName, page, context: seg }
          });
          continue;
        }
      }
    }
  }

  // fallback seeds if nothing parsed
  if (!topics.length) topics.push({ id: 'agile-principles', name: 'Agile Principles' });
  if (!flashcards.length) flashcards.push({ id: 'agile-principles:agile', topicId: 'agile-principles', term: 'Agile', definition: 'Iterative, collaborative, value-first delivery.' });
  if (!questions.length) questions.push({ id: 'agile-principles:q1', topicId: 'agile-principles', prompt: 'Agile values?', options: ['Individuals and interactions', 'Comprehensive documentation', 'Customer collaboration', 'Following a plan'], correct: [0,2], multiCorrect: true, explanation: 'Agile Manifesto core values.' });

  return { topics, flashcards, questions };
}

async function main() {
  try {
    const rootDir = join(__dirname, '..');
    const documentsDir = join(rootDir, 'Documents');
    const dataDir = join(rootDir, 'data');

    try {
      await fs.access(documentsDir);
    } catch {
      console.log('No Documents directory found; skipping PDF parsing');
      return;
    }

    await fs.mkdir(dataDir, { recursive: true });

  const files = await fs.readdir(documentsDir);
    const pdfs = files.filter((f) => extname(f).toLowerCase() === '.pdf');

    const aggregate = { topics: [], flashcards: [], questions: [], lastUpdated: new Date().toISOString() };

    for (const pdf of pdfs) {
      const abs = join(documentsDir, pdf);
      console.log('Parsing PDF:', pdf);
      try {
        const pages = await extractTextFromPdf(abs);
        let pagesToParse = pages;
        // If this is the target syllabus, focus on page 9
        if (/ISTQB-CTFL-AT_Syllabus_2014 3\.pdf$/i.test(pdf)) {
          pagesToParse = pages.filter((p) => p.page === 9);
        }
        const structured = naiveParseToStructure(pagesToParse, pdf);
        const outFile = join(dataDir, pdf.replace(/\.pdf$/i, '.json'));
        await fs.writeFile(outFile, JSON.stringify(structured, null, 2));
        aggregate.topics.push(...structured.topics);
        aggregate.flashcards.push(...structured.flashcards);
        aggregate.questions.push(...structured.questions);
      } catch (e) {
        console.warn('Failed to parse', pdf, e.message || e);
      }
    }

    // Also emit a combined index
    const indexPath = join(dataDir, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(aggregate, null, 2));

    console.log('PDF parsing completed. Data written to data/*.json');
  } catch (error) {
    console.error('Failed to parse PDFs:', error);
    process.exit(1);
  }
}

main();