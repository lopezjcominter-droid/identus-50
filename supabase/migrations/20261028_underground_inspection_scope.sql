alter table public.building_inspection_types add column if not exists floor text;
update public.building_inspection_types set floor = '' where floor is null;
alter table public.building_inspection_types alter column floor set default '';
alter table public.building_inspection_types alter column floor set not null;
alter table public.building_inspection_types drop constraint if exists building_inspection_types_project_id_building_id_inspection_type_id_key;
create unique index if not exists building_inspection_types_scope_uidx on public.building_inspection_types(project_id, building_id, inspection_type_id, floor);
create index if not exists building_inspection_types_floor_idx on public.building_inspection_types(project_id, building_id, floor);
