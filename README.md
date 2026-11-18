# Identus 50 — QA/QC

Web app for electrical QA/QC on the Identus 50 residential project. It covers progress by unit and system, quality inspections, Punch List, Field Issues, Quantity Control, Official Final, reports, and an AI assistant for the project drawings.

## Where the data lives
- **Supabase** (`kihsukzcbohmxovbyisi`). The database holds units, systems, inspections, punch list, issues, quantity control, official final, profiles and project members. Storage bucket `identus-files` holds photos, drawings, reports and reports; daily backups go to the private bucket `identus-backups` (`<project>/<date>.json`, admins only).
- **Browser localStorage** holds screen preferences and drafts only. Project data lives in Supabase. The only exception is local preview mode (`file://`).
- Access is controlled by Supabase Auth plus Row Level Security, checked per project through `project_members`.

## Code
- `index.html` — the whole front end, in a single file.
- `field-issues.js`, `ai-knowledge.js` — modules loaded by `index.html`.
- `sw.js` — the service worker (offline cache).
- `netlify/functions/` — server functions:
  - `admin-users`: user management.
  - `ai-*`: the AI assistant and drawing reading. `ai-process-cron` runs every 10 minutes.
  - `notify-digest*`: the daily email; the cron runs hourly.
- `supabase/migrations/` — SQL changes, run by hand in the Supabase SQL Editor.

## Deploy
Netlify deploys automatically on every push to `main` on GitHub. There is no build step (`publish = "."`).
Each production deploy uses Netlify credits, so group your changes into one commit.

## Environment variables (Netlify → Site configuration → Environment variables)
| Variable | Use |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase access for the functions |
| `AI_PROVIDER` (`gemini`/`openai`), `AI_READ_PROVIDER` | Which AI answers the chat and which one reads the drawings |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `OPENAI_API_KEY`, `OPENAI_*_MODEL` | AI keys and models |
| `RESEND_API_KEY`, `NOTIFY_FROM`, `APP_URL` | Daily digest email |

Keys are never written in the code.

## Roles
| Role | Can do |
|---|---|
| `admin` | Everything: users, Project Setup, clear data, backup and restore |
| `pm` | Project Setup, AI Knowledge Base, reports, field work |
| `inspector` | Progress, inspections, punch list, issues, AI chat |
| `viewer` | Read only |

The legacy value `supervisor` is treated as `pm`. Every person has their own user, created in **Admin Users**. There are no shared passwords.

## Owner
Carlos — Project Manager, Aireko Energy Group.
