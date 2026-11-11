# 5-minute smoke test

Run this after every deploy, or before merging `hardening` → `main`.

## Manual (on the live site or a Deploy Preview)
1. **Login:** sign in with your own user. The Dashboard shows the units and "Last updated".
2. **Create an inspection:** ⚡ Inspections → search for a test unit → choose the type.
3. **FAIL with photo:** mark one item **FAIL**, write a comment, add a photo → **Confirm Failure**. Mark the rest PASS → **✅ Submit Inspection**. The summary must appear.
4. **See the punch item:** 📝 Punch List → the item for that unit appears with the comment and 📷 1. Open **View**: the photo can be seen.
5. **Logout:** Sign out → the login screen appears. Open the URL in a private window: without signing in, no data is shown.

If anything fails: don't merge, and send a screenshot to Claude.

## Automated (Playwright, local copy, does not touch Supabase)
Steps 2–4 run in local preview mode (`?local=1`). The data stays inside the test browser.
```
python3 -m http.server 8765        # in the repo folder
npx -y @playwright/test@1.63.0 test tests/smoke.spec.js
```
Expected result: `1 passed`. Login and logout are not part of the automated test; they need real users.
