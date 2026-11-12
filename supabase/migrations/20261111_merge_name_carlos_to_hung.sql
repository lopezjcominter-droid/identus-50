-- Credit old records saved under "Carlos" to the admin user "Hung".
-- (6 progress entries, 4 inspections, 7 issues — counted on 2026-11-11)
begin;
update unit_systems_status s set events = (
  select jsonb_agg(case when e->>'by' = 'Carlos' then jsonb_set(e, '{by}', '"Hung"') else e end order by ord)::text
  from jsonb_array_elements(s.events::jsonb) with ordinality as t(e, ord))
where s.events is not null and s.events::jsonb @> '[{"by":"Carlos"}]';
update inspection_records set inspector_name = 'Hung' where inspector_name = 'Carlos';
update field_issues set created_by_name = 'Hung' where created_by_name = 'Carlos';
commit;
select 'done' as result;
