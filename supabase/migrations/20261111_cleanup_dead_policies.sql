-- Applied 2026-11-11. These policies used auth.role() = 'authenticated_user',
-- a role that never exists, so they never allowed anything.
drop policy if exists "Enable read access for all authenticated users" on public.inspection_events;
drop policy if exists "Enable read access for all authenticated users" on public.inspection_systems;
drop policy if exists "Enable read access for all authenticated users" on public.photos;
drop policy if exists "Enable read access for all authenticated users" on public.punch_list_evidence;
drop policy if exists "Enable read access for all authenticated users" on public.buildings;
drop policy if exists "Enable read access for all authenticated users" on public.projects;
