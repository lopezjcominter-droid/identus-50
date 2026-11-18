-- Security fixes (2026-11-17). Safe to run more than once.
-- 1) Daily backups move to a PRIVATE bucket; only admins of the project can read/write them.
-- 2) Nobody can list or read identus-files through the API without signing in.
--    (Photos keep working: their public links still open for anyone who already has the link.)
-- 3) projects and buildings are no longer readable without signing in.

-- 1) Private bucket for backups: identus-backups/<project_id>/<date>.json
insert into storage.buckets (id, name, public)
values ('identus-backups', 'identus-backups', false)
on conflict (id) do update set public = false;

drop policy if exists identus_backups_admin_read on storage.objects;
drop policy if exists identus_backups_admin_insert on storage.objects;
drop policy if exists identus_backups_admin_update on storage.objects;
create policy identus_backups_admin_read on storage.objects for select to authenticated
  using (bucket_id = 'identus-backups' and (current_profile_role() = 'admin'
         or has_project_access(((storage.foldername(name))[1])::uuid, array['admin'])));
create policy identus_backups_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'identus-backups' and (current_profile_role() = 'admin'
         or has_project_access(((storage.foldername(name))[1])::uuid, array['admin'])));
create policy identus_backups_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'identus-backups' and (current_profile_role() = 'admin'
         or has_project_access(((storage.foldername(name))[1])::uuid, array['admin'])));

-- 2) identus-files: drop every SELECT policy open to anon/public, keep signed-in read.
do $$
declare p record;
begin
  for p in select policyname from pg_policies
           where schemaname = 'storage' and tablename = 'objects' and cmd in ('SELECT', 'ALL')
             and (roles @> array['anon']::name[] or roles @> array['public']::name[])
             and coalesce(qual, '') ilike '%identus-files%'
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
    raise notice 'dropped storage policy %', p.policyname;
  end loop;
end $$;
drop policy if exists identus_files_read on storage.objects;
create policy identus_files_read on storage.objects for select to authenticated
  using (bucket_id = 'identus-files');

-- 3) projects / buildings: members (or a global admin) read; nobody reads without signing in.
drop policy if exists projects_member_read on public.projects;
create policy projects_member_read on public.projects for select to authenticated
  using (current_profile_role() = 'admin'
         or has_project_access(id, array['admin','pm','inspector','viewer','supervisor']));
drop policy if exists buildings_member_read on public.buildings;
create policy buildings_member_read on public.buildings for select to authenticated
  using (current_profile_role() = 'admin'
         or has_project_access(project_id, array['admin','pm','inspector','viewer','supervisor']));
do $$
declare p record;
begin
  for p in select tablename, policyname from pg_policies
           where schemaname = 'public' and tablename in ('projects', 'buildings') and cmd in ('SELECT', 'ALL')
             and (roles @> array['anon']::name[] or roles @> array['public']::name[])
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    raise notice 'dropped % policy %', p.tablename, p.policyname;
  end loop;
end $$;

select 'security fixes ready' as result;
