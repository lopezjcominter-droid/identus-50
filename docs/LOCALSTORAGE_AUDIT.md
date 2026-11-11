# localStorage audit (point 8)

`index.html` has 144 `localStorage` calls across 27 keys. Each key is classified as:
- **(a)** screen preference
- **(b)** cache or draft
- **(c)** real project data

**Local preview** means the app opened with `?local=1` or as a `file://`. The live site (identus-50.netlify.app) never runs in that mode.

## Summary
**In production, no real project data (c) lives only in the browser.** That is why you see the same data on two computers. Every (c) key below is used only in local preview. In production the same data is read and saved in Supabase.

The Quantity Control contours are already in Supabase: they are saved to `quantity_contours`, and the contours of special areas to `quantity_area_states`, with `quantity_floor_plans` alongside. `local_project_data` is written only when `LOCAL_PROJECT_MODE` or `file://` is active.

## Table
| Key | Calls | Class | Production | Local preview | Supabase equivalent |
|---|---|---|---|---|---|
| `cfg_language` | 14 | a | used (language per device) | used | — (per device, OK) |
| `cfg_alerts` | 4 | a | used (browser alerts on/off) | used | — (per device, OK) |
| `cfg_last_auto_backup` | 2 | a | used (daily backup already done) | used | — |
| `cfg_user_name` / `user_name` | 12 | a | not used (name comes from the session) | used | `profiles.name` |
| `cfg_project_id` / `cfg_project_name` / `cfg_project_address` | 12 | a | remembers the last project; name and address are read from `projects` | used | `projects` |
| `cfg_supabase_url` / `cfg_supabase_key` | 6 | a | not used (fixed values) | used | — |
| `local_project_catalog` | 3 | a | project list for the selector | used | `projects` |
| `identus_remote_data_cache` | 4 | b | disabled (`saveRemoteDataCache` returns without writing); only cleared | — | — |
| `inspection_draft_<apt>_<type>` | 4 | b | only cleared (drafts go to `inspection_drafts`) | used | `inspection_drafts` |
| `inspections_data` | 8 | b in prod / c in local | stale copy written when an inspection is deleted; never read in prod | used | `inspection_records` + items |
| `local_punchlist` | 5 | c | stale copy written when an inspection is deleted; never read in prod | used | `punch_list` |
| `local_deleted_punch_ids` | 6 | c | not used | used | (row deleted in `punch_list`) |
| `local_project_data` | 4 | c | not used | used | `units` + `unit_systems_status` + `buildings` |
| `local_project_setup` | 2 | c | not used | used | `project_setup_config` |
| `insp_building_config` | 6 | c | not used (reads `building_inspection_types`) | used | `building_inspection_types` |
| `quantity_control_v1` | 5 | c | not used | used | `quantity_*` tables |
| `official_final_inspections` | 3 | c | not used | used | `official_final_records` |
| `official_inspection_requests` | 2 | c | not used | used | `official_inspection_requests` |
| `inspection_required_tasks` | 2 | c | not used | used | `inspection_required_tasks` |
| `local_audit_log` | 8 | c | not used | used | (no table; see below) |
| `cfg_notification_recipients` / `cfg_digest_enabled` | 5 | c | not used (the panel appears only in local) | used | `notification_settings` |
| `${base}_${projectId}` (scoped copies of the above) | 1 | c | not used | used | — |

## Proposal for point 9
1. **Nothing has to be migrated** to keep production data safe; it is already all in Supabase.
2. **Optional cleanup:** stop writing `inspections_data` and `local_punchlist` in production when an inspection is deleted. Those are copies nobody reads. This is a 2-line change.
3. **Real gap:** there is no change log (audit) in Supabase for units and inspections; `local_audit_log` only exists in local. If you want one, the next step would be a `project_audit_log` table with RLS (insert for members, read for admin/pm).
