-- Applied 2026-11-15. Project switcher (Procore-style): one row per project the
-- user can open, with small totals. Read-only.
create or replace function public.project_picker_summary()
returns table (id uuid, name text, address text, created_at timestamptz, units bigint, buildings bigint, progress numeric, completed_units bigint, my_role text, last_activity timestamptz)
language sql stable security definer set search_path to 'public' as $$
  select p.id, p.name, p.address, p.created_at,
    (select count(*) from units u where u.project_id = p.id),
    (select count(*) from buildings b where b.project_id = p.id),
    (select round(avg(coalesce(s.progress, 0))::numeric, 1) from unit_systems_status s where s.project_id = p.id),
    (select count(*) from (select s.unit_id from unit_systems_status s where s.project_id = p.id group by s.unit_id having min(coalesce(s.progress, 0)) >= 100) c),
    case when current_profile_role() = 'admin' then 'admin' else (select m.role from project_members m where m.project_id = p.id and m.user_id = auth.uid() limit 1) end,
    (select max(s.updated_at) from unit_systems_status s where s.project_id = p.id)
  from projects p
  where has_project_access(p.id)
  order by p.name;
$$;
grant execute on function public.project_picker_summary() to authenticated;
