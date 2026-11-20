-- Field Issues: closing an issue requires proof (note + photos). Safe to run more than once.
alter table public.field_issues add column if not exists resolution_note text;
alter table public.field_issues add column if not exists resolution_photos jsonb not null default '[]'::jsonb;
select 'field issue resolution ready' as result;
