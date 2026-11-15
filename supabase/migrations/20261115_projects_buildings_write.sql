-- Applied 2026-11-15. Admins can create projects; admin/PM of a project can
-- edit its name/address and its buildings (there was no write policy).
drop policy if exists projects_admin_insert on public.projects;
create policy projects_admin_insert on public.projects for insert to authenticated with check (current_profile_role() = 'admin');
drop policy if exists projects_manage_update on public.projects;
create policy projects_manage_update on public.projects for update to authenticated using (has_project_access(id, array['admin','pm'])) with check (has_project_access(id, array['admin','pm']));
drop policy if exists buildings_manage_write on public.buildings;
create policy buildings_manage_write on public.buildings for all to authenticated using (has_project_access(project_id, array['admin','pm'])) with check (has_project_access(project_id, array['admin','pm']));
