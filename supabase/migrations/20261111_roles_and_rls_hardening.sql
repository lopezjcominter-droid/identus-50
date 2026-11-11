-- Identus 50 · Hardening points 2 and 3 (run once in Supabase → SQL Editor).
-- Based on the real policies exported on 2026-11-11.
--
-- Point 2: one role vocabulary (admin, pm, inspector, viewer).
--   current_profile_role() already maps 'supervisor' → 'pm', but
--   is_project_manager() still checked 'supervisor', so PMs were never
--   recognized (inspection drafts / records written by others).
--   Also: 7 PMs exist only in project_members (their profile says 'inspector'),
--   so the PM check now also looks at the membership.
--
-- Point 3: units, unit_systems_status, punch_list and the photos bucket were
--   open to the PUBLIC/anon key (anyone with the page could read, edit or
--   delete them). They now require a signed-in project member; viewers are
--   read-only; mass deletes of units are admin/PM only. Project Setup writes
--   were already admin/PM only (project_setup_config_write).
-- The Netlify functions use the service role and are not affected.

begin;

-- ---------- Point 2: roles ----------
update public.profiles set role = 'pm' where lower(role) in ('supervisor','project manager','project_manager');
update public.project_members set role = 'pm' where lower(role) in ('supervisor','project manager','project_manager');

create or replace function public.is_project_manager()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.current_profile_role() in ('admin','pm')
      or exists (select 1 from public.project_members m where m.user_id = auth.uid() and lower(m.role) in ('admin','pm'));
$$;

-- ---------- Point 3: units ----------
drop policy if exists "Allow public delete on units" on public.units;
drop policy if exists "Allow public insert on units" on public.units;
drop policy if exists "Allow public read on units" on public.units;
drop policy if exists "Allow public update on units" on public.units;
drop policy if exists "Enable read access for all authenticated users" on public.units;
create policy units_read   on public.units for select to authenticated using (has_project_access(project_id));
create policy units_insert on public.units for insert to authenticated with check (has_project_access(project_id, array['admin','pm']));
create policy units_update on public.units for update to authenticated using (has_project_access(project_id, array['admin','pm','inspector'])) with check (has_project_access(project_id, array['admin','pm','inspector']));
create policy units_delete on public.units for delete to authenticated using (has_project_access(project_id, array['admin','pm']));

-- ---------- Point 3: unit_systems_status (progress) ----------
drop policy if exists "Allow all" on public.unit_systems_status;
create policy uss_read  on public.unit_systems_status for select to authenticated using (has_project_access(project_id));
create policy uss_write on public.unit_systems_status for all to authenticated using (has_project_access(project_id, array['admin','pm','inspector'])) with check (has_project_access(project_id, array['admin','pm','inspector']));

-- ---------- Point 3: punch_list ----------
drop policy if exists "Allow public delete on punch_list" on public.punch_list;
drop policy if exists "Allow public insert on punch_list" on public.punch_list;
drop policy if exists "Allow public read on punch_list" on public.punch_list;
drop policy if exists "Allow public update on punch_list" on public.punch_list;
drop policy if exists "Enable read access for all authenticated users" on public.punch_list;
create policy punch_read  on public.punch_list for select to authenticated using (has_project_access(project_id));
create policy punch_write on public.punch_list for all to authenticated using (has_project_access(project_id, array['admin','pm','inspector'])) with check (has_project_access(project_id, array['admin','pm','inspector']));

-- ---------- Point 3: projects (anyone could rename/edit a project) ----------
drop policy if exists "anon update projects" on public.projects;

-- ---------- Point 3: photos bucket (anon could upload/overwrite) ----------
drop policy if exists "identus insert" on storage.objects;
drop policy if exists "identus update" on storage.objects;
-- "identus read" stays: photos are shown with public links (also in PDFs/emails).
drop policy if exists identus_files_update on storage.objects;
create policy identus_files_update on storage.objects for update to authenticated
  using (bucket_id = 'identus-files' and auth.uid() is not null)
  with check (bucket_id = 'identus-files' and auth.uid() is not null);

commit;

-- ---------- ROLLBACK (only if something stops working) ----------
-- create policy "Allow all" on public.unit_systems_status for all to public using (true) with check (true);
-- create policy "Allow public read on units" on public.units for select to public using (true);
-- create policy "Allow public update on units" on public.units for update to public using (true);
-- create policy "Allow public read on punch_list" on public.punch_list for select to public using (true);
-- create policy "Allow public insert on punch_list" on public.punch_list for insert to public with check (true);
-- create policy "Allow public update on punch_list" on public.punch_list for update to public using (true);
-- create policy "identus insert" on storage.objects for insert to anon with check (bucket_id = 'identus-files');
