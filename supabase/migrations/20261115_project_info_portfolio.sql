-- Applied 2026-11-15. Project details (Procore-style), archive and portfolio.
alter table public.projects add column if not exists client text;
alter table public.projects add column if not exists permit_number text;
alter table public.projects add column if not exists logo_path text;
update public.projects set status = 'active' where status is null or status = '';
alter table public.projects alter column status set default 'active';

drop function if exists public.project_picker_summary();
create or replace function public.project_picker_summary()
returns table (id uuid, name text, address text, created_at timestamptz, units bigint, buildings bigint, progress numeric,
  completed_units bigint, my_role text, last_activity timestamptz, status text, client text, contractor text,
  permit_number text, start_date date, end_date date, logo_path text,
  open_issues bigint, open_punch bigint, failed_inspections bigint, inspections bigint)
language sql stable security definer set search_path to 'public' as $$
  select p.id, p.name::text, p.address::text, p.created_at::timestamptz,
    (select count(*) from units u where u.project_id = p.id),
    (select count(*) from buildings b where b.project_id = p.id),
    (select round(avg(coalesce(s.progress, 0))::numeric, 1) from unit_systems_status s where s.project_id = p.id),
    (select count(*) from (select s.unit_id from unit_systems_status s where s.project_id = p.id group by s.unit_id having min(coalesce(s.progress, 0)) >= 100) c),
    case when current_profile_role() = 'admin' then 'admin' else (select m.role from project_members m where m.project_id = p.id and m.user_id = auth.uid() limit 1) end,
    greatest((select max(s.updated_at) from unit_systems_status s where s.project_id = p.id),
             (select max(r.created_at) from inspection_records r where r.project_id = p.id),
             (select max(i.created_at) from field_issues i where i.project_id = p.id)),
    coalesce(nullif(p.status, ''), 'active')::text, p.client, p.contractor::text, p.permit_number,
    p.start_date::date, p.end_date::date, p.logo_path,
    (select count(*) from field_issues i where i.project_id = p.id and coalesce(i.status, 'open') <> 'resolved'),
    (select count(*) from punch_list x where x.project_id = p.id and coalesce(x.status, 'Open') <> 'Closed'),
    (select count(*) from inspection_records r where r.project_id = p.id and coalesce(r.fail_count, 0) > 0),
    (select count(*) from inspection_records r where r.project_id = p.id)
  from projects p
  where has_project_access(p.id)
  order by p.name;
$$;
grant execute on function public.project_picker_summary() to authenticated;
select 'ok' as result;
