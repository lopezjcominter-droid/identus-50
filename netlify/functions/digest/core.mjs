// Shared logic for the daily notification digest (Netlify Functions).
// Required Netlify environment variables:
//   SUPABASE_SERVICE_ROLE_KEY (already used by admin-users)
//   RESEND_API_KEY            (from resend.com)
// Optional: SUPABASE_URL, NOTIFY_FROM ("Identus 50 <notificaciones@aireko.com>"), APP_URL
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kihsukzcbohmxovbyisi.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const FROM = process.env.NOTIFY_FROM || 'Identus 50 <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'https://identus-50.netlify.app';

const headers = () => ({ apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' });
export async function rest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const text = await response.text();
  let body = null; try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }
  if (!response.ok) throw new Error(`Supabase ${response.status} ${path.split('?')[0]}: ${typeof body === 'string' ? body : (body?.message || '')}`);
  return body;
}
const esc = value => String(value ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const DEFAULTS = { enabled: true, send_hour: 6, timezone: 'America/New_York', include_completed: true, include_inspections: true, include_official_ready: true, include_punch: true, excluded_user_ids: [], extra_emails: [], last_sent_on: null };

function localParts(date, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(p => [p.type, p.value]));
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export async function loadSettings(projectId) {
  const rows = await rest(`/rest/v1/notification_settings?project_id=eq.${projectId}&select=*`);
  return { ...DEFAULTS, project_id: projectId, ...(rows?.[0] || {}) };
}

// Builds the digest content for one project.
export async function buildDigest(projectId, settings, now = new Date()) {
  const since = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const [project] = await rest(`/rest/v1/projects?id=eq.${projectId}&select=name`);
  const units = await rest(`/rest/v1/units?project_id=eq.${projectId}&select=id,unit_number,building_id`);
  const buildings = await rest(`/rest/v1/buildings?project_id=eq.${projectId}&select=id,name`);
  const buildingName = new Map((buildings || []).map(b => [b.id, b.name]));
  const unitLabel = new Map((units || []).map(u => [u.id, `${u.unit_number} · ${buildingName.get(u.building_id) || ''}`.trim()]));
  const sections = [];
  // Order = priority: what needs action first.
  if (settings.include_punch !== false) {
    const created = await rest(`/rest/v1/punch_list?project_id=eq.${projectId}&created_at=gte.${encodeURIComponent(since)}&select=title,unit_id,priority,status,assigned_to,source,type&order=created_at.desc`);
    if (created?.length) {
      const rank = p => ({ high: 0, urgent: 0, critical: 0, medium: 1, low: 2 }[String(p || '').toLowerCase()] ?? 1);
      created.sort((a, b) => rank(a.priority) - rank(b.priority));
      sections.push({ title: 'New Punch List items', tone: 'alert', items: created.map(r => `${r.priority ? `[${String(r.priority).toUpperCase()}] ` : ''}Unit ${unitLabel.get(r.unit_id) || '—'} — ${r.title || 'Item'}${r.source === 'inspection' ? ` (failed inspection${r.type ? ': ' + r.type : ''})` : ''}${r.assigned_to ? ` · assigned to ${r.assigned_to}` : ''}`) });
    }
    const closed = await rest(`/rest/v1/punch_list?project_id=eq.${projectId}&closed_at=gte.${encodeURIComponent(since)}&select=title,unit_id,closed_by`);
    if (closed?.length) sections.push({ title: 'Punch List items closed', tone: 'good', items: closed.map(r => `Unit ${unitLabel.get(r.unit_id) || '—'} — ${r.title || 'Item'}${r.closed_by ? ` · by ${r.closed_by}` : ''}`) });
  }
  if (settings.include_completed) {
    const rows = await rest(`/rest/v1/unit_systems_status?project_id=eq.${projectId}&progress=gte.100&updated_at=gte.${encodeURIComponent(since)}&select=unit_id,system_id,updated_at`);
    if (rows?.length) sections.push({ title: 'Systems completed (100%)', tone: 'good', items: rows.map(r => `Unit ${unitLabel.get(r.unit_id) || r.unit_id} — ${r.system_id === 'Electric Panel' ? 'Electrical Panel / Load Center' : r.system_id}`) });
  }
  if (settings.include_inspections) {
    const rows = await rest(`/rest/v1/inspection_records?project_id=eq.${projectId}&created_at=gte.${encodeURIComponent(since)}&select=unit_id,inspection_type_id,inspector_name,status,pass_count,fail_count,total_count`);
    if (rows?.length) {
      let typeName = new Map();
      try { typeName = new Map((await rest(`/rest/v1/inspection_types?project_id=eq.${projectId}&select=id,name,code`) || []).map(t => [t.id, t.name || t.code])); } catch (_) {}
      rows.sort((a, b) => Number(b.fail_count || 0) - Number(a.fail_count || 0));
      const failed = rows.filter(r => Number(r.fail_count || 0) > 0).length;
      sections.push({ title: failed ? `QA / QC inspections — ${failed} with failures` : 'QA / QC inspections', tone: failed ? 'alert' : 'neutral', items: rows.map(r => `Unit ${unitLabel.get(r.unit_id) || r.unit_id} — ${typeName.get(r.inspection_type_id) || 'Inspection'} by ${r.inspector_name || 'inspector'}: ${Number(r.fail_count || 0) > 0 ? `${r.fail_count} failed` : 'passed'} (${r.pass_count || 0}/${r.total_count || 0})`) });
    }
  }
  if (settings.include_official_ready) {
    const rows = await rest(`/rest/v1/inspection_required_tasks?project_id=eq.${projectId}&kind=eq.official_ready&resolved_at=is.null&select=apt,payload,completed_at`);
    if (rows?.length) sections.push({ title: 'Units ready for final inspection', tone: 'good', items: rows.map(r => `Unit ${r.apt}${r.payload?.building ? ' · ' + r.payload.building : ''}`) });
  }
  const toneRank = { alert: 0, neutral: 1, good: 2 };
  sections.sort((a, b) => (toneRank[a.tone] ?? 1) - (toneRank[b.tone] ?? 1));
  const name = project?.name || 'Identus 50';
  const alerts = sections.filter(x => x.tone === 'alert').reduce((n, x) => n + x.items.length, 0);
  const subject = `[${name}] ${alerts ? `⚠️ ${alerts} item${alerts === 1 ? '' : 's'} need attention · ` : ''}Daily summary — ${now.toLocaleDateString('en-US', { timeZone: settings.timezone, month: 'short', day: 'numeric', year: 'numeric' })}`;
  let openSummary = '';
  if (settings.include_punch !== false) {
    try {
      const open = await rest(`/rest/v1/punch_list?project_id=eq.${projectId}&closed_at=is.null&select=priority`);
      const high = (open || []).filter(r => ['high', 'urgent', 'critical'].includes(String(r.priority || '').toLowerCase())).length;
      openSummary = `${(open || []).length} open Punch List items${high ? ` (${high} high priority)` : ''}`;
    } catch (_) {}
  }
  const toneColor = { alert: '#B91C1C', good: '#15803D', neutral: '#1E3A8A' };
  const chips = sections.map(s => `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:${s.tone === 'alert' ? '#FEE2E2' : s.tone === 'good' ? '#DCFCE7' : '#E0E7FF'};color:${toneColor[s.tone] || toneColor.neutral};font-size:12px;font-weight:600;">${esc(s.title.replace(/ —.*/, ''))}: ${s.items.length}</span>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;color:#111827;max-width:640px;"><h2 style="color:#1E3A8A;margin:0 0 4px;">${esc(name)}</h2><div style="color:#6B7280;font-size:13px;margin-bottom:12px;">Updates from the last 24 hours${openSummary ? ' · ' + esc(openSummary) : ''}</div>${chips ? `<div style="margin-bottom:8px;">${chips}</div>` : ''}${sections.map(s => `<h3 style="font-size:15px;margin:16px 0 6px;color:${toneColor[s.tone] || toneColor.neutral};border-left:4px solid ${toneColor[s.tone] || toneColor.neutral};padding-left:8px;">${esc(s.title)} (${s.items.length})</h3><ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.5;">${s.items.slice(0, 100).map(i => `<li>${esc(i)}</li>`).join('')}${s.items.length > 100 ? `<li>…and ${s.items.length - 100} more</li>` : ''}</ul>`).join('') || '<p style="font-size:14px;">No important updates in the last 24 hours.</p>'}<p style="margin-top:20px;font-size:13px;"><a href="${esc(APP_URL)}?project=${esc(projectId)}">Open Identus 50</a></p><p style="color:#9CA3AF;font-size:11px;">You receive this because you are a member of this project. An administrator can change it in Project Setup → Notifications.</p></div>`;
  return { subject, html, sections, count: sections.reduce((n, s) => n + s.items.length, 0) };
}

export async function recipientsFor(projectId, settings) {
  const members = await rest(`/rest/v1/project_members?project_id=eq.${projectId}&select=user_id`);
  const excluded = new Set((settings.excluded_user_ids || []).map(String));
  const ids = new Set((members || []).map(m => String(m.user_id)).filter(id => !excluded.has(id)));
  const emails = new Set();
  if (ids.size) {
    const users = await rest('/auth/v1/admin/users?per_page=1000');
    (users?.users || []).forEach(u => { if (ids.has(String(u.id)) && u.email && !(u.banned_until && new Date(u.banned_until) > new Date())) emails.add(u.email.toLowerCase()); });
  }
  (settings.extra_emails || []).forEach(e => { const v = String(e || '').trim().toLowerCase(); if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) emails.add(v); });
  return [...emails];
}

export async function sendEmail(to, subject, html) {
  if (!RESEND_KEY) throw new Error('RESEND_API_KEY is not configured in Netlify');
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: FROM, to: [to], subject, html }) });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 200)}`);
}

// Called every hour: sends each project's digest once per day at its hour.
export async function runScheduled(now = new Date()) {
  if (!SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  const projects = await rest('/rest/v1/projects?select=id');
  const results = [];
  for (const { id } of projects || []) {
    try {
      const settings = await loadSettings(id);
      const local = localParts(now, settings.timezone || 'America/New_York');
      if (!settings.enabled || local.hour !== Number(settings.send_hour) || settings.last_sent_on === local.day) continue;
      // Mark first, so a retry of this hour never sends twice.
      await rest('/rest/v1/notification_settings?on_conflict=project_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ project_id: id, last_sent_on: local.day, updated_at: new Date().toISOString() }) });
      const digest = await buildDigest(id, settings, now);
      if (!digest.count) { results.push({ id, skipped: 'no updates' }); continue; }
      const to = await recipientsFor(id, settings);
      let sent = 0;
      for (const email of to) { try { await sendEmail(email, digest.subject, digest.html); sent++; } catch (error) { console.error('digest send failed', email, error.message); } }
      results.push({ id, sent, items: digest.count });
    } catch (error) { console.error('digest project failed', id, error.message); results.push({ id, error: error.message }); }
  }
  return results;
}
