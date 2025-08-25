# Agile Tester Exam Prep

An exam preparation platform for "Certified Tester Foundation Level Extension Syllabus – Agile Tester".

- Reads syllabus content from `/Documents` (copied to public at build).
- Generates quizzes, flashcards, and study tools from that material.
- Deployed to GitHub Pages (static export). Optional persistence via Supabase.

## Tech Stack
- Frontend: Next.js (React + TailwindCSS, TypeScript)
- Backend: Serverless via Supabase (auth + DB). App runs fully client-side with local storage fallback if Supabase is not configured.
- Database: Supabase (recommended). LocalStorage fallback for demos.
- Testing: Jest + React Testing Library
- Deployment: GitHub Pages via GitHub Actions

## Features
- User auth (username/password via local demo; Supabase-ready)
- Dashboard with progress, recommendations, mastery heatmap
- Quiz mode with multi-correct questions, explanations, confidence meter
- Flashcards with SM-2 spaced repetition
- Adaptive learning: repeat weak areas more frequently
- Timed exam simulation with pass/fail and breakdown
- Notes per topic
- Leaderboard of your best sessions
- Export to PDF/CSV
- Modern, accessible UI with dark mode (WCAG-minded)

## Repository Structure
- `/Documents` – syllabus files (Markdown). Copied to `public/Documents` at build.
- `/public` – static assets (includes a `.nojekyll` file for Pages).
- `/src` – frontend code and client-side data logic
  - `/components` – UI components
  - `/lib` – parser, algorithms, auth/db helpers
  - `/pages` – routes (Next.js Pages router)
- `/tests` – Jest tests
- `.github/workflows` – CI + Pages deployment

## Quick Start (Local)
1. Install Node.js 18+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local`:
   ```bash
   cp .env.example .env.local
   # Optionally add Supabase URL + anon key
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```
5. Visit http://localhost:3000/agile-tester-exam-prep (basePath set for Pages; locally it still works with the base path).

## Build + Export
```bash
npm run build
npm run export
# static site in ./out
```

## Deploy to GitHub Pages
This repo includes a GitHub Actions workflow that:
- Builds and exports the site (Next.js static export)
- Publishes to GitHub Pages using the "GitHub Pages" environment

Steps:
1. Push the repository to GitHub (e.g., `Stefan-001/agile-tester-exam-prep`).
2. In repo Settings → Pages:
   - Set Source = "GitHub Actions".
3. On push to `main`, the Pages workflow will build and deploy.
4. Your site will be at:
   - https://<your-username>.github.io/agile-tester-exam-prep/

Note: basePath and assetPrefix are pre-set to `/agile-tester-exam-prep` in `next.config.mjs`.

## Supabase (Optional but Recommended)
1. Create a Supabase project at https://supabase.com.
2. Copy the project URL and anon key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Create tables (SQL suggestion):
   ```sql
   -- results table
   create table if not exists public.results (
     id uuid primary key,
     user_id text not null,
     created_at timestamp with time zone not null,
     question_id text not null,
     correct boolean not null,
     selected jsonb not null,
     confidence text not null
   );

   -- progress table
   create table if not exists public.progress (
     user_id text primary key,
     updated_at timestamp with time zone not null,
     topic_mastery jsonb not null,
     badges jsonb not null,
     streak_days int not null default 0
   );
   ```
4. The app will automatically use Supabase when configured; otherwise it stores data locally in the browser.

## Documents Format
Place syllabus files in `/Documents` (Markdown). Example structure:

```
# Topic Name
Intro text...

## Terms
- Term: Definition
- Iteration: A timeboxed period to deliver incremental value

## Sample Questions
Q: In an Agile context, what is the primary goal of the daily standup?
- A) Provide detailed status updates to management
- B) Synchronize the team and identify impediments
- C) Estimate story points
- D) Review performance metrics
Correct: B
Explain:
- A: Management reports are not the purpose of the standup
- B: Correct - alignment and impediment discovery
- C: Estimation is done during planning, not daily
- D: Metrics reviews are not the goal of the standup
```

The build copies `/Documents` to `public/Documents`.

## Testing
```bash
npm run test
```

## Accessibility
- Semantic HTML
- Keyboard-operable controls
- Color-contrast-friendly themes
- Focus outlines and ARIA roles/labels

## Security
- Production auth should be backed by Supabase (or another provider). Local demo auth uses in-browser storage and SHA-256 hashing for demonstration only.

## Roadmap
- Richer parser to support more formats (PDF/Docx via pre-processing)
- Topic-to-question mapping improvements
- Multi-user leaderboards
- More robust analytics dashboards

## License
MIT