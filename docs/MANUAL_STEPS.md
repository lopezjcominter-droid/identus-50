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

## Phase 3

### F. Deploy Preview for the `hardening` branch (point 12)
1. Netlify → **identus-50** → **Site configuration** → **Build & deploy** → **Branches and deploy contexts** → **Configure**.
2. **Branch deploys:** choose **Let me add individual branches** → type `hardening` → **Save**.
3. **Deploy Previews:** leave **Any pull request against your production branch** turned on.
4. Every push to `hardening` then publishes at `https://hardening--identus-50.netlify.app` without touching production. Run `docs/SMOKE_TEST.md` there before merging.
⚠️ Each preview deploy also uses Netlify credits. Push to `hardening` in batches.

## Phase 4 — Operations

### G. Lower Netlify usage (point 14)
**Today:**
- 15 credits per production deploy, out of 300 a month on the free plan.
- The `ai-process-cron` function runs every 10 minutes, about 4,300 times a month, even when no document is waiting to be read.
- The digest runs hourly, 720 times a month, and sends one email a day per project.

**Changes** (applied on 2026-11-11):
1. ✅ `ai-process-cron`: now runs every 30 minutes, and stops right away when nothing is pending. **▶ Read now** still works immediately.
2. ⏸ The digest **stays hourly**. Each project picks its own send hour in its settings, and the cron has to pass through that exact hour. Every run that isn't the chosen hour ends after one quick read.
3. Group your changes: merge `hardening` → `main` once a day at most.

**Usage alerts:**
1. Netlify → **Team settings** → **Billing** → **Usage**: check credits once a week.
2. Netlify → **Team settings** → **Notifications** → turn on the email when you reach 50% / 75% / 90% of your credits.
3. Supabase → **Organization** → **Billing** → **Usage**: watch **Egress**. The free plan includes 5 GB, and October went over.

**Alternatives** (check current prices before deciding):
| | Netlify (today) | Cloudflare Pages | Vercel |
|---|---|---|---|
| Free static deploys | credits (≈20 deploys/month) | ~500 builds/month | ~100 deploys/day |
| Functions / cron | Netlify Functions + scheduled | Workers (100k requests/day free) + Cron Triggers | Functions; cron is limited on Hobby |
| Commercial use on the free plan | yes | yes | **no**: Hobby is personal use only, so Pro is required (USD 20/user) |
| Migration effort | — | medium: rewrite the 7 functions as Workers | low/medium |

**Recommendation:** stay on Netlify and lower the crons. If credits still run short, the next steps are Netlify Pro or Cloudflare Pages.

### H. Backups outside Supabase (point 15)
**Today:**
- A daily JSON backup is saved in the bucket of the **same** Supabase project.
- The 💾 Backup button downloads a copy to your PC.
- If the Supabase account or project is lost, you lose the backup too.

**Nightly external backup (GitHub Actions, free on a private repo):**
1. Supabase → **Project Settings** → **Database** → **Connection string** (URI, "Session pooler"). Copy it.
2. GitHub → repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - `SUPABASE_DB_URL` = that string
   - `SUPABASE_URL` = `https://kihsukzcbohmxovbyisi.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = the service role key
3. Ask Claude for `.github/workflows/nightly-backup.yml`. It runs every night and does three things:
   - `pg_dump` of the database
   - downloads the new photos from the `identus-files` bucket
   - saves both as a workflow artifact (90 days), or to OneDrive through a OneDrive/SharePoint connector (needs `rclone` with a company account)
4. **Restore test (once a month):**
   - Create an empty Supabase project, then `psql <new URL> < backup.sql`.
   - Point a copy of the app to it with `?local=1` → Project Setup → custom Supabase URL/key, and check that the units and inspections show up.
   - Delete the test project afterwards.

### I. Move the accounts to the company (point 15)
1. **Company email:** create a shared address, for example `qaqc@aireko.com`, owned by the company.
2. **GitHub:**
   - Create the organization `aireko-qaqc` with the company email.
   - Repo → **Settings** → **Transfer ownership** to the organization. Links and history are kept.
   - Add a **second Owner**.
3. **Netlify:**
   - Create a Team with the company email and invite yourself.
   - **Site configuration** → **Transfer site** to the Team.
   - **Build & deploy** → **Repository** → reconnect to the repo in the organization, and confirm that the Netlify app has permission in GitHub (org → **Settings** → **GitHub Apps** → Netlify → access to the repo).
4. **Supabase:**
   - Create an Organization with the company email.
   - Project → **Settings** → **General** → **Transfer project**.
   - Invite a second **Owner**.
   - The URL and keys don't change, so the app keeps working.
5. **Claude GitHub app:** after the transfer, reinstall it on the organization, for `identus-50` only.
6. **Make the repo private:**
   - GitHub → **Settings** → **General** → **Danger zone** → **Change visibility** → Private.
   - Then make a test deploy in Netlify: if it fails, Netlify → **Build & deploy** → **Link repository** again.
7. **Shared password manager:**
   - Use Bitwarden Teams or 1Password Business, with a "Identus 50" vault shared with the second administrator.
   - Store in it: GitHub, Netlify, Supabase, the OpenAI/Gemini/Resend keys, and the Supabase service role.
   - **Rotate** the OpenAI and Gemini keys after the move, since they were pasted in chats.
