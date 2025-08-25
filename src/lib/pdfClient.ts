// Client-side fallback parser using pdfjs-dist (Option A)
// Not used in CI by default; provided for local/browser parsing when needed.
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

// Configure worker
GlobalWorkerOptions.workerSrc = pdfWorker as unknown as string;

export async function parsePdfUrl(url: string): Promise<string> {
  const loadingTask = getDocument(url);
  const pdf = await loadingTask.promise;
  const max = pdf.numPages;
  let text = '';
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i: any) => i.str).join(' ') + '\n';
  }
  return text;
}