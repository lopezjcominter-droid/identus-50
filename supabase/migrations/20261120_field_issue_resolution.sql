-- Field Issues: closing an issue requires proof (note + photos). Safe to run more than once.
alter table public.field_issues add column if not exists resolution_note text;
alter table public.field_issues add column if not exists resolution_photos jsonb not null default '[]'::jsonb;
select 'field issue resolution ready' as result;

-- Weekly Field Issues e-mail: one row per project. Only admins/PMs of the project read or change it.
create table if not exists public.field_issue_report_settings (
  project_id uuid primary key references public.projects(id) on delete cascade,
  enabled boolean not null default false,
  weekday smallint not null default 5,          -- 0=Sunday … 5=Friday
  send_time text not null default '18:00',
  timezone text not null default 'America/New_York',
  recipients text not null default '',
  subject text not null,
  body text not null,
  sender_name text, sender_title text, company text, sender_phone text,
  last_sent_at timestamptz,
  updated_by_name text,
  updated_at timestamptz not null default now()
);
alter table public.field_issue_report_settings enable row level security;
drop policy if exists fi_report_settings_rw on public.field_issue_report_settings;
create policy fi_report_settings_rw on public.field_issue_report_settings for all to authenticated
  using (current_profile_role() = 'admin' or has_project_access(project_id, array['admin','pm']))
  with check (current_profile_role() = 'admin' or has_project_access(project_id, array['admin','pm']));
select 'weekly report settings ready' as result;
