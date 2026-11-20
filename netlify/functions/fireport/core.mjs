// Weekly Field Issues report: PDF (pdf-lib) + e-mail (Resend). One project at a time.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { rest } from '../digest/core.mjs';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const APP_URL = process.env.APP_URL || 'https://identus-50.netlify.app';
const SENDER = 'Aireko QA/QC Automated System';
const fromAddress = () => {
  const raw = process.env.FI_REPORT_FROM || process.env.NOTIFY_FROM || 'onboarding@resend.dev';
  const m = raw.match(/<([^>]+)>/); return `${SENDER} <${m ? m[1] : raw.trim()}>`;
};
const DAY = 86400000;
const COMPANY = ['AIREKO ENERGY GROUP US', '2415 W Sand Lake Road Ste E', 'Orlando, Florida 32809', '407-706-2800 | 407-595-9467', 'www.airekoenergygroup.com'];
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Standard PDF fonts only know Latin-1 (+ a few signs): replace anything else.
const safe = v => String(v ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7E -ÿ–—•]/g, '');
const fmtDate = (d, tz) => new Date(d).toLocaleDateString('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' });

export function localParts(date, timeZone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(x => [x.type, x.value]));
  return { weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute) };
}

export async function loadReportSettings(projectId) {
  const [row] = await rest(`/rest/v1/field_issue_report_settings?project_id=eq.${projectId}&select=*`);
  return row || null;
}

async function fetchJpeg(url) {
  try {
    const r = await fetch(url); if (!r.ok) return null;
    const type = r.headers.get('content-type') || ''; const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.length > 4_000_000) return null;
    return { buf, png: /png/.test(type) || (buf[0] === 0x89 && buf[1] === 0x50) };
  } catch (_) { return null; }
}

export async function buildReport(projectId, settings, now = new Date()) {
  const tz = settings?.timezone || 'America/New_York';
  const [project] = await rest(`/rest/v1/projects?id=eq.${projectId}&select=name`);
  const name = project?.name || 'Project';
  const all = await rest(`/rest/v1/field_issues?project_id=eq.${projectId}&select=*&order=created_at.asc`) || [];
  const weekAgo = now.getTime() - 7 * DAY;
  const open = all.filter(i => i.status !== 'resolved');
  const daysOpen = i => Math.floor((now.getTime() - Date.parse(i.created_at)) / DAY);
  const old = open.filter(i => daysOpen(i) > 7);
  const resolvedWeek = all.filter(i => i.status === 'resolved' && i.resolved_at && Date.parse(i.resolved_at) >= weekAgo);
  const newWeek = all.filter(i => Date.parse(i.created_at) >= weekAgo);
  const date = fmtDate(now, tz);
  const vars = { project: name, date, resolved_week: resolvedWeek.length, open_count: open.length, old_count: old.length, contact_email: settings?.sender_title || 'your Aireko project manager', total: all.length };
  const fill = t => String(t || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  const subject = fill(settings?.subject || '{project} – Weekly Field Issues Report | Week Ending {date}');
  const text = fill(settings?.body || '');
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111827;max-width:640px;line-height:1.5">
    <img src="${APP_URL}/assets/aeg-logo.png" alt="Aireko Energy Group" style="height:56px;margin-bottom:12px">
    ${esc(text).split(/\n{2,}/).map(p => `<p style="margin:0 0 12px">${p.replace(/\n/g, '<br>')}</p>`).join('')}
    <div style="border-top:2px solid #0B5394;margin-top:16px;padding-top:10px;font-size:12px;color:#334155;line-height:1.45"><b style="color:#0B5394">${COMPANY[0]}</b><br>${COMPANY[1]}<br>${COMPANY[2]}<br>${COMPANY[3]}<br><a href="https://www.airekoenergygroup.com" style="color:#0B5394">${COMPANY[4]}</a></div></div>`;
  const textFull = `${text}\n\n--\n${COMPANY.join('\n')}`;

  // ---------- PDF ----------
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 612, H = 792, M = 36; const BLUE = rgb(0.043, 0.325, 0.58), GRAY = rgb(0.39, 0.45, 0.55), DARK = rgb(0.06, 0.09, 0.16), RED = rgb(0.86, 0.15, 0.15), GREEN = rgb(0.09, 0.64, 0.29), AMBER = rgb(0.85, 0.47, 0.02);
  let page, y;
  let logo = null; try { const l = await fetchJpeg(`${APP_URL}/assets/aeg-logo.png`); if (l) logo = await pdf.embedPng(l.buf); } catch (_) {}
  const newPage = () => {
    page = pdf.addPage([W, H]); y = H - M;
    if (logo) { const h = 40, w = logo.width * h / logo.height; page.drawImage(logo, { x: M, y: y - h, width: w, height: h }); }
    page.drawText('QA/QC Automated System', { x: M, y: y - 52, size: 8, font, color: GRAY });
    page.drawText(safe(`Report date: ${date}`), { x: W - M - font.widthOfTextAtSize(`Report date: ${date}`, 9), y: y - 14, size: 9, font, color: GRAY });
    const wk = `Week of ${fmtDate(weekAgo, tz)} – ${date}`; page.drawText(safe(wk), { x: W - M - font.widthOfTextAtSize(safe(wk), 9), y: y - 27, size: 9, font, color: GRAY });
    page.drawRectangle({ x: M, y: y - 60, width: W - 2 * M, height: 2.5, color: BLUE });
    y -= 76;
  };
  const need = h => { if (y - h < M + 20) newPage(); };
  const wrap = (t, size, f, width) => { const words = safe(t).split(/\s+/); const lines = []; let line = ''; for (const w of words) { const test = line ? line + ' ' + w : w; if (f.widthOfTextAtSize(test, size) > width && line) { lines.push(line); line = w; } else line = test; } if (line) lines.push(line); return lines; };
  newPage();
  page.drawText('Weekly Field Issues Report', { x: M, y, size: 18, font: bold, color: DARK }); y -= 16;
  page.drawText(safe(`Project: ${name}`), { x: M, y, size: 10, font, color: GRAY }); y -= 22;
  const kpis = [[open.length, 'Open issues', RED], [old.length, 'Open more than 7 days', RED], [resolvedWeek.length, 'Resolved this week', GREEN], [newWeek.length, 'New this week', DARK]];
  const kw = (W - 2 * M - 24) / 4;
  kpis.forEach(([n, label, c], k) => { const x = M + k * (kw + 8); page.drawRectangle({ x, y: y - 46, width: kw, height: 46, borderColor: rgb(0.89, 0.91, 0.94), borderWidth: 1 }); page.drawText(String(n), { x: x + 8, y: y - 24, size: 18, font: bold, color: c }); page.drawText(label, { x: x + 8, y: y - 38, size: 8, font, color: DARK }); });
  y -= 62;
  const table = (x, title, rows, width) => { let yy = y; page.drawRectangle({ x, y: yy - 14, width, height: 14, color: rgb(0.945, 0.96, 0.976) }); page.drawText(title.toUpperCase(), { x: x + 4, y: yy - 10, size: 7, font: bold, color: GRAY }); page.drawText('COUNT', { x: x + width - 40, y: yy - 10, size: 7, font: bold, color: GRAY }); yy -= 14; rows.forEach(([a, b]) => { page.drawText(safe(a), { x: x + 4, y: yy - 11, size: 9, font, color: DARK }); page.drawText(String(b), { x: x + width - 40, y: yy - 11, size: 9, font, color: DARK }); yy -= 15; page.drawLine({ start: { x, y: yy + 1 }, end: { x: x + width, y: yy + 1 }, thickness: 0.5, color: rgb(0.89, 0.91, 0.94) }); }); return y - yy; };
  const aging = [['0–7 days', open.filter(i => daysOpen(i) <= 7).length], ['8–14 days', open.filter(i => daysOpen(i) > 7 && daysOpen(i) <= 14).length], ['15+ days', open.filter(i => daysOpen(i) > 14).length]];
  const types = [...new Set(open.map(i => i.issue_type))].map(t => [t, open.filter(i => i.issue_type === t).length]).sort((a, b) => b[1] - a[1]);
  const half = (W - 2 * M - 12) / 2;
  const h1 = table(M, 'Aging (open)', aging, half), h2 = table(M + half + 12, 'Open by type', types.length ? types : [['None', 0]], half);
  y -= Math.max(h1, h2) + 16;
  const section = t => { need(30); page.drawText(t, { x: M, y, size: 12, font: bold, color: BLUE }); page.drawLine({ start: { x: M, y: y - 4 }, end: { x: W - M, y: y - 4 }, thickness: 0.7, color: rgb(0.8, 0.84, 0.88) }); y -= 18; };
  const photoRow = async urls => {
    const list = (urls || []).slice(0, 3); if (!list.length) return;
    const pw = (W - 2 * M - 30) / 3, ph = 105; need(ph + 6); let x = M + 10;
    for (const u of list) { const img = await fetchJpeg(u); if (!img) continue; try { const e = img.png ? await pdf.embedPng(img.buf) : await pdf.embedJpg(img.buf); const s = Math.min(pw / e.width, ph / e.height); page.drawImage(e, { x: x + (pw - e.width * s) / 2, y: y - ph + (ph - e.height * s) / 2, width: e.width * s, height: e.height * s }); } catch (_) {} x += pw + 5; }
    y -= ph + 6;
  };
  const issueBlock = async (i, n, resolved) => {
    const desc = wrap(i.description || 'No description', 10, bold, W - 2 * M - 20);
    need(48 + desc.length * 12);
    const top = y; const bar = resolved ? GREEN : RED;
    let x = M + 10;
    if (n) { page.drawRectangle({ x, y: y - 11, width: 16, height: 12, color: BLUE }); page.drawText(String(n), { x: x + 4, y: y - 9, size: 8, font: bold, color: rgb(1, 1, 1) }); x += 22; }
    page.drawText(safe(`Unit ${i.apt}`), { x, y: y - 9, size: 10, font: bold, color: DARK }); x += bold.widthOfTextAtSize(safe(`Unit ${i.apt}`), 10) + 8;
    const loc = safe([i.building, i.floor].filter(Boolean).join(' · ')); page.drawText(loc, { x, y: y - 9, size: 9, font, color: GRAY }); x += font.widthOfTextAtSize(loc, 9) + 8;
    page.drawText(safe(i.issue_type), { x, y: y - 9, size: 8, font, color: rgb(0.57, 0.25, 0.05) });
    const tag = resolved ? `Resolved ${fmtDate(i.resolved_at, tz)}` : `${daysOpen(i)} days open`; const tc = resolved ? GREEN : daysOpen(i) > 7 ? RED : daysOpen(i) > 3 ? AMBER : GRAY;
    const tw = bold.widthOfTextAtSize(tag, 8) + 12; page.drawRectangle({ x: W - M - tw - 6, y: y - 12, width: tw, height: 13, color: tc }); page.drawText(tag, { x: W - M - tw, y: y - 9, size: 8, font: bold, color: rgb(1, 1, 1) });
    y -= 24; desc.forEach(l => { page.drawText(l, { x: M + 10, y, size: 10, font: bold, color: DARK }); y -= 12; });
    page.drawText(safe(`Reported by ${i.created_by_name || '-'} · ${fmtDate(i.created_at, tz)}`), { x: M + 10, y, size: 8, font, color: GRAY }); y -= 10;
    if (!resolved) await photoRow(i.photos);
    else {
      const fix = wrap(`Corrective action: ${i.resolution_note || ''}`, 9, font, W - 2 * M - 30);
      need(fix.length * 11 + 16); fix.forEach(l => { page.drawText(l, { x: M + 14, y: y - 2, size: 9, font, color: rgb(0.09, 0.4, 0.2) }); y -= 11; });
      page.drawText(safe(`Closed by ${i.resolved_by_name || '-'}`), { x: M + 14, y: y - 2, size: 8, font, color: GRAY }); y -= 12;
      await photoRow(i.resolution_photos);
    }
    if (page === pdf.getPage(pdf.getPageCount() - 1) && top > y) page.drawRectangle({ x: M, y: y + 2, width: 3, height: Math.min(top - y - 2, H), color: bar });
    y -= 10;
  };
  section('Open issues (oldest first)');
  if (!open.length) { page.drawText('No open issues.', { x: M + 10, y, size: 10, font, color: GRAY }); y -= 16; }
  for (const [k, i] of open.entries()) await issueBlock(i, k + 1, false);
  section('Resolved this week');
  if (!resolvedWeek.length) { page.drawText('No issues resolved this week.', { x: M + 10, y, size: 10, font, color: GRAY }); y -= 16; }
  for (const i of resolvedWeek) await issueBlock(i, 0, true);
  pdf.getPages().forEach((p, k, arr) => { const t = safe(`Generated automatically by the Aireko QA/QC System · ${name} · Page ${k + 1} of ${arr.length}`); p.drawText(t, { x: (W - font.widthOfTextAtSize(t, 7)) / 2, y: 14, size: 7, font, color: GRAY }); const c = safe(`${COMPANY[0]} · ${COMPANY[1]}, ${COMPANY[2]} · ${COMPANY[3]} · ${COMPANY[4]}`); p.drawText(c, { x: (W - font.widthOfTextAtSize(c, 7)) / 2, y: 24, size: 7, font, color: GRAY }); });
  const bytes = await pdf.save();
  const filename = `${name.replace(/[^\w]+/g, '_')}_Field_Issues_${new Date(now).toISOString().slice(0, 10)}.pdf`;
  return { subject, html, text: textFull, pdf: Buffer.from(bytes).toString('base64'), filename, counts: vars };
}

export async function sendReport(to, report) {
  if (!RESEND_KEY) throw new Error('RESEND_API_KEY is not configured in Netlify');
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromAddress(), to, subject: report.subject, html: report.html, text: report.text, attachments: [{ filename: report.filename, content: report.pdf }] }) });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

// Every 15 minutes: send each enabled project once per week at its day/time.
export async function runScheduledReports(now = new Date()) {
  const rows = await rest('/rest/v1/field_issue_report_settings?enabled=eq.true&select=*') || [];
  const results = [];
  for (const s of rows) {
    try {
      const local = localParts(now, s.timezone || 'America/New_York');
      const [hh, mm] = String(s.send_time || '18:00').split(':').map(Number);
      if (local.weekday !== Number(s.weekday) || local.hour * 60 + local.minute < hh * 60 + (mm || 0)) continue;
      if (s.last_sent_at && now.getTime() - Date.parse(s.last_sent_at) < 2 * DAY) continue;
      const to = String(s.recipients || '').split(/[,;\s]+/).filter(e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
      if (!to.length) continue;
      // Mark first, so a retry never sends twice.
      await rest(`/rest/v1/field_issue_report_settings?project_id=eq.${s.project_id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ last_sent_at: now.toISOString() }) });
      const report = await buildReport(s.project_id, s, now);
      await sendReport(to, report);
      results.push({ project: s.project_id, sent: to.length });
    } catch (e) { console.error('fi report failed', s.project_id, e.message); results.push({ project: s.project_id, error: e.message }); }
  }
  return results;
}
