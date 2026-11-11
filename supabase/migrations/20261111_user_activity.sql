-- Identus 50 · User Activity (admin/PM): work registered by each person,
-- computed inside the database from data that already exists (progress
-- events, inspections, punch list, issues) plus the change log. Only small
-- totals travel to the browser.
drop function if exists public.user_activity_summary(uuid, text);
create or replace function public.user_activity_summary(p_project_id uuid, p_tz text default 'America/New_York')
returns table (person text, kind text, total bigint, last7 bigint, today bigint, last_at timestamptz, last_what text, last30 bigint, days30 text[])
language sql stable security definer set search_path to 'public' as $$
  with allowed as (select has_project_access(p_project_id, array['admin','pm']) as ok),
  progress as (
    select coalesce(nullif(trim(e->>'by'), ''), 'Unknown') as person, 'Progress'::text as kind,
           (e->>'timestamp')::timestamptz as at, coalesce(u.unit_number::text, '') || ' · ' || s.system_id as what
    from unit_systems_status s
    join units u on u.id = s.unit_id
    cross join lateral jsonb_array_elements(case when s.events is null then '[]'::jsonb else s.events::text::jsonb end) e
    where s.project_id = p_project_id and (e->>'timestamp') is not null
  ),
  insp as (
    select coalesce(nullif(trim(r.inspector_name), ''), 'Unknown'), 'Inspection', coalesce(r.submitted_at, r.created_at),
           coalesce(u.unit_number::text, '')
    from inspection_records r left join units u on u.id = r.unit_id
    where r.project_id = p_project_id
  ),
  punch as (
    select coalesce(nullif(trim(p.closed_by), ''), 'Unknown'), 'Punch closed', p.closed_at, coalesce(p.title, '')
    from punch_list p where p.project_id = p_project_id and p.closed_at is not null
  ),
  issues as (
    select coalesce(nullif(trim(i.created_by_name), ''), 'Unknown'), 'Issue', i.created_at, coalesce(i.apt, '')
    from field_issues i where i.project_id = p_project_id
  ),
  allrows as (select * from progress union all select * from insp union all select * from punch union all select * from issues),
  ranked as (
    select person, kind, at, what, row_number() over (partition by person, kind order by at desc) rn
    from allrows where at is not null
  )
  select person, kind, count(*),
         count(*) filter (where at >= now() - interval '7 days'),
         count(*) filter (where (at at time zone p_tz)::date = (now() at time zone p_tz)::date),
         max(at), max(what) filter (where rn = 1),
         count(*) filter (where at >= now() - interval '30 days'),
         array_agg(distinct ((at at time zone p_tz)::date)::text) filter (where at >= now() - interval '30 days')
  from ranked, allowed where allowed.ok
  group by person, kind;
$$;
grant execute on function public.user_activity_summary(uuid, text) to authenticated;
select 'user activity ready' as result;
