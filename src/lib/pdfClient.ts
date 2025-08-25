// Optional client-side parser using pdfjs-dist; not imported by default
// to avoid build complexity when unused.
export async function parsePdfUrl(_url: string): Promise<string> {
  throw new Error('Client-side PDF parsing is not enabled. Use CI preprocessing.');
}