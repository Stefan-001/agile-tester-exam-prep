# Agile Tester Exam Prep (CTFL-AT)

A fully static, GitHub Pages–hosted prep platform for "Certified Tester Foundation Level Extension Syllabus – Agile Tester".

<<<<<<< HEAD
## Key Features
=======
- Reads syllabus content from `/Documents` (copied to public at build) and preprocesses PDFs to JSON under `/data` via GitHub Actions.
- Generates quizzes, flashcards, and study tools from that material.
- Deployed to GitHub Pages (static export). Optional persistence via Supabase.
>>>>>>> main

- Next.js (static export) + TailwindCSS + TypeScript
- Auth via Supabase (email magic link), with graceful fallback if unconfigured
- PDF processing workflow:
  - GitHub Actions preprocesses `/Documents/*.pdf` → `/data/*.json`
  - Commits generated JSON back to the repo
  - Copies `/data` to `public/data` for static export
- Dashboard with progress tracking (localStorage baseline)
- Quiz mode (MCQs, multi-correct supported) with explanations
- Flashcards auto-generated from syllabus
- Adaptive learning (focus on weak topics)
- Timed exam simulation (timer + grading + pass/fail)
- Leaderboard (Supabase table `leaderboard`) with localStorage fallback
- Notes per topic
- Confidence meter
- Spaced repetition (SM-2-like)
- Client-side export (PDF/CSV)
- CI: tests + build + deploy to GitHub Pages

## Repository Structure
<<<<<<< HEAD
=======
- `/Documents` – syllabus files (PDF and/or Markdown). Copied to `public/Documents` at build.
- `/data` – generated JSON from PDF preprocessing (published to `public/data`).
- `/public` – static assets (includes a `.nojekyll` file for Pages).
- `/src` – frontend code and client-side data logic
  - `/components` – UI components
  - `/lib` – parser, algorithms, auth/db helpers
  - `/pages` – routes (Next.js Pages router)
- `/tests` – Jest tests
- `.github/workflows` – CI + Pages deployment
>>>>>>> main

- `/Documents` — syllabus PDF files (source of truth)
- `/data` — generated JSON from PDFs (CI writes here)
- `/public/data` — copied from `/data` during build for static export
- `/src/components` — reusable UI components
- `/src/lib` — helpers (auth, data, quiz, adaptive, spaced repetition, exports)
- `/src/app` — Next.js App Router pages
- `/tests` — Jest tests
- `.github/workflows/deploy.yml` — CI pipeline (test + parse PDFs + build + deploy)

## Prerequisites

- Node.js 20+
- Supabase project (optional but recommended for auth/leaderboard)

## Local Setup

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Create `.env.local` from `.env.example` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_PATH`:
     - For GitHub Pages project site: `/agile-tester-exam-prep`
     - For local dev (Next dev server): can be empty

3. Add your syllabus PDFs into `Documents/`.

4. Generate data locally (optional; CI will do this on push):
   ```bash
   npm run parse:pdfs
   npm run prepare:data
   ```

5. Run dev server:
   ```bash
   npm run dev
   ```

<<<<<<< HEAD
## Build & Export Static

npm run build:static
```

Static site is generated under `out/`.
=======
To force local PDF → JSON preprocessing (optional locally):
```bash
npm run parse:pdfs
npm run prepare:data
```

## Build + Export
```bash
npm run build:static
# static site in ./out
```

Note: This project uses Next.js 14+ with `output: 'export'` configuration. The build process includes:
- PDF parsing with pdfjs-dist (`npm run parse:pdfs`) → writes `/data/index.json`
- Data preparation (`npm run prepare:data`) copies `/data` to `/public/data`
- Static site generation (`next build`)
- GitHub Pages optimization (`.nojekyll` creation)

## Deploy to GitHub Pages
This repo includes a GitHub Actions workflow that:
- Builds and exports the site (Next.js static export)
- Publishes to GitHub Pages using the "GitHub Pages" environment
>>>>>>> main

## Deployment (GitHub Pages)

This repo includes `.github/workflows/deploy.yml` which:
- Parses PDFs → `/data/*.json` and commits changes
- Runs tests
- Builds and exports the static site
- Deploys to GitHub Pages

<<<<<<< HEAD
Repository Settings → Pages:
- Source: "GitHub Actions"
- After a successful run, your site will be at:

## Supabase Setup (Optional but Recommended)

3. Enable email auth (magic link)
4. Redirect URL: 
   - `https://<your-username>.github.io/agile-tester-exam-prep/` (and local `http://localhost:3000`)
5. For leaderboard, create a table:
     score int not null,
     "when" timestamptz default now()
   Add Row Level Security (RLS) as appropriate.
=======
## Supabase (Optional but Recommended)
2. Copy the project URL and anon key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Apply schema + RLS policies (recommended): see `supabase/schema.sql` (copy into Supabase SQL editor and run).
4. The app will automatically use Supabase when configured; otherwise it stores data locally in the browser.

## Documents Format
Place syllabus files in `/Documents` (PDF and/or Markdown). The build will:
- Parse PDFs with pdfjs-dist into `/data/index.json` using heuristics:
   - Topic detection from numbered headings like `1.1` or `Section 2`.
   - Term extraction from `Term: Definition` or `Term – Definition` segments.
   - Question prompts detected by lines ending with `?` or containing phrases like `example`.
   - MCQ options detected from nearby segments like `A) ...`, `B) ...`, up to four options. Falls back to a True/False style when options aren’t detected.
- Copy any markdown under `/Documents` to `public/Documents` as a fallback source.

Tip: To improve parsing quality, prefer clear headings, `Term: Definition` pairs, and format options as `A)`, `B)`, `C)`, `D)` near the question text in the source PDF.

Example Markdown structure:

```

## Terms
- Term: Definition
- Iteration: A timeboxed period to deliver incremental value

## Sample Questions
Q: In an Agile context, what is the primary goal of the daily standup?
- A) Provide detailed status updates to management
- B) Synchronize the team and identify impediments
Explain:
- A: Management reports are not the purpose of the standup
- B: Correct - alignment and impediment discovery
```

The build copies `/Documents` to `public/Documents`.
>>>>>>> main

Advanced: Refining heuristics
- The parser lives at `scripts/parse-pdfs.mjs`. You can tweak patterns for topics, terms, and options.
- Consider tagging content with consistent labels (e.g., “Definition: …”) or add a curated `data/index.json` for full control.

## Testing

```bash
npm run test
```

## Notes on PDF Parsing

- CI uses a heuristic parser (`scripts/parse-pdfs.mjs`) to extract topics, terms (from `Label: Definition` lines), and generate simple MCQs from sentences.
- You can refine the heuristics to better match the syllabus formatting.
- Client-side fallback parser using `pdfjs-dist` is provided in `src/lib/pdfClient.ts` if you need in-browser parsing.

## Accessibility & Mobile

- Mobile-first layout and dark mode friendly
- Uses semantic HTML and keyboard-friendly controls

## License

Content derived from the syllabus belongs to their respective owners. This repository provides tooling and structure only.