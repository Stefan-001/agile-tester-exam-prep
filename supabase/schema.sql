-- Supabase schema and RLS policies for Agile Tester Prep

-- results table
create table if not exists public.results (
  id uuid primary key,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  question_id text not null,
  correct boolean not null,
  selected jsonb not null,
  confidence text not null
);

-- progress table
create table if not exists public.progress (
  user_id uuid primary key,
  updated_at timestamptz not null default now(),
  topic_mastery jsonb not null,
  badges jsonb not null,
  streak_days int not null default 0
);

-- Enable RLS
alter table public.results enable row level security;
alter table public.progress enable row level security;

-- Policies: each authenticated user can manage only their own rows
create policy if not exists "results_insert_own" on public.results
  for insert to authenticated with check (auth.uid() = user_id);
create policy if not exists "results_select_own" on public.results
  for select to authenticated using (auth.uid() = user_id);
create policy if not exists "results_update_own" on public.results
  for update to authenticated using (auth.uid() = user_id);
create policy if not exists "results_delete_own" on public.results
  for delete to authenticated using (auth.uid() = user_id);

create policy if not exists "progress_upsert_own" on public.progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy if not exists "progress_select_own" on public.progress
  for select to authenticated using (auth.uid() = user_id);
create policy if not exists "progress_update_own" on public.progress
  for update to authenticated using (auth.uid() = user_id);
create policy if not exists "progress_delete_own" on public.progress
  for delete to authenticated using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists results_user_id_created_at_idx on public.results(user_id, created_at);
