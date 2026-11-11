# Manual steps (Supabase / Netlify / GitHub)

Steps done in the service panels, not in the code.

## Phase 1

### A. Export the real security setup (needed for points 2 and 3)
1. Supabase → your project → **SQL Editor** → **New query**.
2. Open `supabase/export_policies.sql`, copy **block 1**, paste it, click **Run**.
3. In the results, click **Copy** (or download the CSV) and paste it to Claude.
4. Repeat for blocks 2, 3, 4 and 5.
These queries only read; they change nothing.

### B. One user per person (point 7) — already supported
The app → **Admin Users** → **Add user**: name, email, a temporary password (8+ characters) and a role (Admin / PM / Inspector / Viewer).
- Create one user for each person; don't share accounts.
- To remove access: use **Deactivate**, or set the role to **None** for the project.
- The old shared password (3010) no longer works anywhere in the app.

### C. Apply roles + security policies (points 2 and 3)
1. Run this when nobody is saving, for example at night.
2. Supabase → **SQL Editor** → **New query** → paste all of `supabase/migrations/20261111_roles_and_rls_hardening.sql` → **Run**. It should finish with "Success".
3. Check right away (5 min):
   - Sign in as an inspector: update progress on a unit with a photo, close a punch item, save an inspection.
   - Sign in as a PM: open Project Setup and save.
   - Open the app in a private window without signing in: it must NOT show units.
4. If something fails to save, run the **ROLLBACK** block at the end of the same file (remove the `-- ` at the start of each line) and tell Claude what failed.

## Phase 2

### D. Change log (point 9) — already applied on 2026-11-11
`supabase/migrations/20261111_project_audit_log.sql` was run in the SQL Editor. It records every change made to units, progress, punch list, inspections, Official Final and Issues. To view the log, an Admin or PM clicks **🕘 Change Log** in the app.

### E. Concurrency (point 10) — what is protected
- **Progress (unit_systems_status):** saves only if the row did not change since it was read (`updated_at` match). On conflict it merges the events of both people and retries (already existed; verified).
- **Punch list:** an item is saved only if nobody changed it since it was loaded. Otherwise the user sees "changed by someone else", and the list reloads.
- **Inspections:** each inspection or re-inspection is a new record, so two people can't overwrite each other.
- **Not covered yet (low risk):**
  - Official Final, which is edited by 1–2 people.
  - Field Issues (the table has no `updated_at`).
  - Project Setup (admin/PM only).
  - Quantity Control writes only the rows that changed.
