# Empty `catch {}` and HTML escaping (point 11)

## Empty catches: 61 in total (index.html 55, other modules 6)
**Harmless (left as they are):**
- Reading or writing preferences in `localStorage`/`sessionStorage`: language, active unit, scroll position.
- Freeing PDF memory (`bitmap.close`, `pdf.destroy`, `task.cancel`).
- `setPointerCapture`.
- Phone notifications.
- Redrawing charts.
- The local preview (`?local=1`).
- Optional lookups that already have a fallback, such as the floor plan id or the closeout PDF data.

**Touching data — reviewed:**
| Where | What happens on error | Action |
|---|---|---|
| Save event / progress with photos (`saveEventNow`) | already shows "Could not save the event…" / "Could not upload photos…"; offline it queues and syncs later | none |
| Submit inspection (`inspSubmitInspection`) | showed an error, but left the unsaved copy in memory, so a retry could duplicate it | **fixed**: removes the copy, keeps the answers (draft) and shows "Could not save — retry" |
| Punch list (`savePunchlist`) | shows "Punch List could not be saved…", plus a conflict warning (point 10) | none |
| Quantity Control (`quantityFlushRemoteSave`) | shows "could not be saved to Supabase" | none |
| Reloads after syncing offline (`loadData` in a `try {}`) | the next automatic refresh fixes the screen | none |
| Field Issues without signal | stays on the device and uploads later | none |

## HTML escaping
Data typed by users was being inserted into `innerHTML` without escaping. A comment with `<` or `"` could break the screen, or inject HTML. Escaping added with `window.esc()` in:
- event notes
- punch list: description, assignee, resolution, closed by (list, detail, report)
- inspection comments (summary, review, failures)
- failure descriptions and comments (Dashboard)

The modules `field-issues.js` and `ai-knowledge.js` already escaped their values.
