-- Identus live parity: preserve inspection-to-Punch relationships and
-- enforce role-aware access for the inspection module.

alter table public.punch_list add column if not exists source text not null default 'manual';
alter table public.punch_list add column if not exists inspection_id uuid;
alter table public.punch_list add column if not exists type text;
alter table public.punch_list add column if not exists type_num text;
alter table public.punch_list add column if not exists comment text;
alter table public.punch_list add column if not exists history jsonb not null default '[]'::jsonb;
alter table public.punch_list add column if not exists closed_by text;
alter table public.punch_list add column if not exists resolution text;

create index if not exists punch_list_inspection_idx on public.punch_list(inspection_id);

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where user_id = auth.uid()), 'viewer');
$$;

create or replace function public.is_project_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() in ('admin', 'supervisor');
$$;

-- Inspection configuration is administrator-owned.
drop policy if exists inspection_types_authenticated on public.inspection_types;
create policy inspection_types_read on public.inspection_types
  for select to authenticated using (auth.uid() is not null);
create policy inspection_types_admin_write on public.inspection_types
  for all to authenticated using (public.current_profile_role() = 'admin')
  with check (public.current_profile_role() = 'admin');

drop policy if exists building_inspection_types_authenticated on public.building_inspection_types;
create policy building_inspection_types_read on public.building_inspection_types
  for select to authenticated using (auth.uid() is not null);
create policy building_inspection_types_admin_write on public.building_inspection_types
  for all to authenticated using (public.current_profile_role() = 'admin')
  with check (public.current_profile_role() = 'admin');

-- Inspectors can create/update their own records; supervisors/admins can
-- review, close, or reset records. Deleting a record cascades its checklist.
drop policy if exists inspection_records_authenticated on public.inspection_records;
create policy inspection_records_read on public.inspection_records
  for select to authenticated using (auth.uid() is not null);
create policy inspection_records_insert on public.inspection_records
  for insert to authenticated with check (auth.uid() is not null and (inspector_id = auth.uid() or public.is_project_manager()));
create policy inspection_records_update on public.inspection_records
  for update to authenticated using (inspector_id = auth.uid() or public.is_project_manager())
  with check (inspector_id = auth.uid() or public.is_project_manager());
create policy inspection_records_delete on public.inspection_records
  for delete to authenticated using (inspector_id = auth.uid() or public.is_project_manager());

drop policy if exists inspection_record_items_authenticated on public.inspection_record_items;
create policy inspection_record_items_read on public.inspection_record_items
  for select to authenticated using (auth.uid() is not null);
create policy inspection_record_items_write on public.inspection_record_items
  for all to authenticated using (
    public.is_project_manager() or exists (
      select 1 from public.inspection_records r
      where r.id = inspection_record_id and r.inspector_id = auth.uid()
    )
  ) with check (
    public.is_project_manager() or exists (
      select 1 from public.inspection_records r
      where r.id = inspection_record_id and r.inspector_id = auth.uid()
    )
  );

drop policy if exists inspection_drafts_authenticated on public.inspection_drafts;
create policy inspection_drafts_read on public.inspection_drafts
  for select to authenticated using (inspector_id = auth.uid() or public.is_project_manager());
create policy inspection_drafts_write on public.inspection_drafts
  for all to authenticated using (inspector_id = auth.uid() or public.is_project_manager())
  with check (inspector_id = auth.uid() or public.is_project_manager());

