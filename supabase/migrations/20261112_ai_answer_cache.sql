-- AI chat: answers to repeated questions, reused while the documents do not
-- change (docs_version) and for at most 7 days. Applied 2026-11-12.
create table if not exists public.ai_answer_cache (
  project_id uuid not null,
  question_key text not null,
  docs_version text not null,
  result jsonb not null,
  hits integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (project_id, question_key)
);
alter table public.ai_answer_cache enable row level security;
drop policy if exists ai_answer_cache_rw on public.ai_answer_cache;
create policy ai_answer_cache_rw on public.ai_answer_cache for all to authenticated
  using (has_project_access(project_id)) with check (has_project_access(project_id));
select 'cache ready' as result;
