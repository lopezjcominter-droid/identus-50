-- Identus 50 · Read-only export of the real security setup.
-- Run each block in Supabase → SQL Editor and paste the results back.
-- Nothing here changes data.

-- 1) Tables and whether RLS is on
select schemaname, tablename, rowsecurity
from pg_tables where schemaname in ('public','storage') order by 1, 2;

-- 2) All RLS policies (public schema)
select tablename, policyname, cmd, roles, permissive, qual as using_expr, with_check
from pg_policies where schemaname = 'public' order by tablename, policyname;

-- 3) Storage policies (buckets / files)
select tablename, policyname, cmd, roles, qual as using_expr, with_check
from pg_policies where schemaname = 'storage' order by tablename, policyname;

-- 4) Role helper functions used by the policies
select p.proname, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('current_profile_role','is_project_manager','has_project_access','is_admin','is_project_admin','is_project_member')
order by 1;

-- 5) Role values in use today (to align them with admin / pm / inspector / viewer)
select 'profiles' as source, coalesce(role,'(null)') as role, count(*) from public.profiles group by role
union all
select 'project_members', coalesce(role,'(null)'), count(*) from public.project_members group by role
order by 1, 2;
