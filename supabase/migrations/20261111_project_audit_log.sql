-- Identus 50 · Point 9: change log in Supabase (who changed what, when).
-- Database triggers record every insert / update / delete on the main tables,
-- whatever device or screen made the change. Only the fields that changed
-- are kept (big fields such as photo lists or full event history are skipped).

create table if not exists public.project_audit_log (
  id bigint generated always as identity primary key,
  project_id uuid,
  table_name text not null,
  row_id text,
  unit_label text,
  action text not null,               -- insert / update / delete
  changes jsonb,                      -- {field: [old, new]} for updates
  changed_by uuid default auth.uid(),
  changed_by_name text,
  changed_at timestamptz not null default now()
);
create index if not exists project_audit_log_project_time on public.project_audit_log (project_id, changed_at desc);

alter table public.project_audit_log enable row level security;
drop policy if exists audit_read on public.project_audit_log;
create policy audit_read on public.project_audit_log for select to authenticated
  using (has_project_access(project_id, array['admin','pm']));
-- No insert/update/delete policies: only the trigger (security definer) writes.

create or replace function public.audit_row_change()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  o jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  n jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  r jsonb := coalesce(n, o);
  skip text[] := array['events','images','history','items','description','payload','checklist','updated_at','created_at','current','draft'];
  diff jsonb := '{}'::jsonb;
  k text;
  label text;
begin
  if tg_op = 'UPDATE' then
    for k in select jsonb_object_keys(n) loop
      if not (k = any(skip)) and (o -> k) is distinct from (n -> k) then
        diff := diff || jsonb_build_object(k, jsonb_build_array(o -> k, n -> k));
      end if;
    end loop;
    -- progress lives inside unit_systems_status; keep it even when events also changed
    if diff = '{}'::jsonb then return null; end if;
  end if;
  label := coalesce(r ->> 'unit_number', r ->> 'apt', r ->> 'location',
    (select u.unit_number from units u where u.id::text = r ->> 'unit_id'));
  if r ? 'system_id' then label := coalesce(label, '') || ' · ' || (r ->> 'system_id'); end if;
  insert into project_audit_log (project_id, table_name, row_id, unit_label, action, changes, changed_by, changed_by_name)
  values (
    coalesce((r ->> 'project_id')::uuid, (select u.project_id from units u where u.id::text = r ->> 'unit_id')),
    tg_table_name, r ->> 'id', label, lower(tg_op),
    case when tg_op = 'UPDATE' then diff
         when tg_op = 'INSERT' then jsonb_strip_nulls(n - skip)
         else jsonb_strip_nulls(o - skip) end,
    auth.uid(),
    (select p.name from profiles p where p.user_id = auth.uid())
  );
  return null;
exception when others then
  -- The log must never block a save.
  raise warning 'audit_row_change skipped: %', sqlerrm;
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['units','unit_systems_status','punch_list','inspection_records','official_final_records','field_issues'] loop
    execute format('drop trigger if exists audit_%1$s on public.%1$I', t);
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$I for each row execute function public.audit_row_change()', t);
  end loop;
end $$;

select 'audit log ready' as result;
