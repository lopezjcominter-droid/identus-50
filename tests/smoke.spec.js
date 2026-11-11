// Identus 50 smoke test (point 12). Runs against a local copy in preview mode
// (?local=1): data stays in the test browser, Supabase is never written.
// Run:  npx playwright test tests/smoke.spec.js   (server: python3 -m http.server 8765)
const { test, expect } = require('@playwright/test');
const path = require('path');
const BASE = process.env.SMOKE_URL || 'http://localhost:8765/index.html?local=1';

test('inspection with a FAIL + photo creates a punch item', async ({ page }) => {
  page.on('dialog', d => d.accept());
  const errors = []; page.on('pageerror', e => errors.push(e.message));

  // 1. App loads (local preview needs no sign-in)
  await page.goto(BASE);
  await expect(page.getByRole('button', { name: /Inspections/ }).first()).toBeVisible({ timeout: 20000 });
  await page.waitForFunction(() => Array.isArray(window.data) && window.data.length > 0, null, { timeout: 20000 });

  // 2. Start an inspection on the first unit, first applicable type
  await page.getByRole('button', { name: /⚡ Inspections/ }).click();
  const apt = await page.evaluate(() => {
    const unit = (typeof inspectionEntitySource === 'function' ? inspectionEntitySource() : window.data)[0];
    inspSelectUnit(unit.apt);
    const type = INSP_INSPECTION_TYPES.find(t => typeof inspIsInspectionTypeApplicableForUnit !== 'function' || inspIsInspectionTypeApplicableForUnit(t, unit));
    inspSelectType(type.id);
    return unit.apt;
  });
  await expect(page.locator('#insp-checklist-body tr').first()).toBeVisible();

  // 3. Everything PASS except item 0 = FAIL with comment and photo (real UI modal)
  await page.evaluate(() => inspChecklistItems.forEach((_, i) => { if (i > 0) inspSetStatus(i, 'PASS'); }));
  await page.evaluate(() => inspSetStatus(0, 'FAIL'));
  await page.locator('#insp-fail-comment').fill('Smoke test failure');
  await page.locator('#insp-photo-input').setInputFiles(path.join(__dirname, 'fixture-photo.png'));
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: /Confirm Failure/ }).click();

  // 4. Submit and see the summary
  await page.getByRole('button', { name: /Submit Inspection/ }).click();
  await expect(page.locator('#insp-step-summary')).toBeVisible({ timeout: 20000 });

  // 5. The punch item exists for that unit
  await page.getByRole('button', { name: /Punch List/ }).first().click();
  await page.waitForFunction(a => (punchlist || []).some(p => String(p.location) === String(a)), apt, { timeout: 15000 });
  const count = await page.evaluate(a => punchlist.filter(p => String(p.location) === String(a)).length, apt);
  const item = await page.evaluate(a => punchlist.find(p => String(p.location) === String(a)), apt);
  expect(item.comment).toBe('Smoke test failure');
  expect((item.photos || []).length).toBeGreaterThan(0);
  expect(count).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
