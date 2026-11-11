# Plan to split index.html (point 13) — PROPOSAL, NOT EXECUTED

`index.html` is about 18.2k lines: ~1.6k CSS, ~0.9k HTML and ~15.7k JavaScript in 5 `<script>` blocks. `field-issues.js` and `ai-knowledge.js` are already separate files and work well. This plan follows the same pattern.

## Principles
- **No build step and no framework.** Each module is a plain `.js` file loaded with `<script src>` in the same order as today. Netlify keeps `publish = "."`, so deploys don't change.
- **One move per commit.** Code is cut and pasted without rewriting it. After each step, run `docs/SMOKE_TEST.md` (the Playwright test plus the manual list) on the `hardening` Deploy Preview.
- **Same global names.** Functions called from `onclick="..."` stay global. Nothing is renamed.
- **Order matters.** `core.js` loads first, and the modules that wrap functions (`addons.js`) load after the ones they wrap.

## Proposed modules (in the order they would be split)
| # | File | Comes from (current lines) | ~lines | Risk |
|---|---|---|---|---|
| 1 | `css/app.css` | the two `<style>` blocks (22–1229, 1230–1439) | 1,600 | very low |
| 2 | `js/inspections.js` | INSPECTION MODULE block (14794–18229) | 3,400 | low: already self-contained, `insp` prefix |
| 3 | `js/auth.js` | AUTH MODULE block (14519–14792) | 270 | low |
| 4 | `js/addons.js` | ADD-ON MODULE block (13877–14518): offline, notifications, stamps, weekly summary | 640 | medium: it wraps functions from core, so it must load after them |
| 5 | `js/quantity-control.js` | "Quantity Control" (2992–6481) | 3,500 | medium: shares `data`, `sbClient` and `PROJECT_ID` |
| 6 | `js/project-setup.js` | PROJECT SETUP + digest + types by building (8327–9999) | 1,700 | medium |
| 7 | `js/punch-list.js` | Punch List: save/load (~6560–6900) + report (13388–13875) | 900 | medium |
| 8 | `js/reports.js` | Excel, Client Report, Closeout PDF, Change Log, Official Final | 1,500 | low |
| 9 | `js/core.js` | the rest: Supabase config, data loading/saving, units, Dashboard, charts, photos, backup | ~3,500 | stays last, by elimination |

## Order and time
- Steps 1–3 are about one session each, with almost no risk.
- Steps 4–8 should go one per day, each with its own preview and smoke test before merging.
- When it's done, `index.html` keeps only the HTML (~1k lines) plus the `<script src>` tags.

## Prerequisites
- Turn on the Deploy Preview for `hardening` (see `docs/MANUAL_STEPS.md` F).
- Netlify credits: each step means one preview deploy plus one production deploy. Group several steps in one merge.
- Optional: adding `"Cache-Control"` headers for `/js/*` in `netlify.toml` keeps iPads from loading stale versions. The service worker `sw.js` already updates files from the network first.
