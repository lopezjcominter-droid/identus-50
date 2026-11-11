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
