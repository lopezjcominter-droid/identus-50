// On demand (admins/PMs): POST { action: 'test' | 'pdf', projectId } with the user's Bearer token.
// test = e-mail this project's report to yourself; pdf = download the PDF.
import { rest } from './digest/core.mjs';
import { normalizeRole } from './ai/roles.mjs';
import { loadReportSettings, buildReport, sendReport } from './fireport/core.mjs';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export default async request => {
  if (request.method !== 'POST') return json(405, { error: 'POST only' });
  try {
    const token = String(request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return json(401, { error: 'Not signed in' });
    const me = await fetch(`${process.env.SUPABASE_URL || 'https://kihsukzcbohmxovbyisi.supabase.co'}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null);
    if (!me?.id) return json(401, { error: 'Invalid session' });
    const body = await request.json().catch(() => ({}));
    const projectId = String(body.projectId || '');
    if (!UUID.test(projectId)) return json(400, { error: 'Invalid project' });
    const [profile] = await rest(`/rest/v1/profiles?user_id=eq.${me.id}&select=role`);
    const [member] = await rest(`/rest/v1/project_members?project_id=eq.${projectId}&user_id=eq.${me.id}&select=role`);
    const role = normalizeRole(member?.role || profile?.role);
    if (!['admin', 'pm'].includes(role)) return json(403, { error: 'Admins or PMs only' });
    const settings = await loadReportSettings(projectId) || {};
    const report = await buildReport(projectId, settings, new Date());
    if (body.action === 'pdf') return json(200, { filename: report.filename, pdf: report.pdf, subject: report.subject });
    if (body.action === 'test') { await sendReport([me.email], report); return json(200, { ok: true, sentTo: me.email, counts: report.counts }); }
    return json(400, { error: 'Unknown action' });
  } catch (error) { return json(500, { error: error.message || 'Unexpected error' }); }
};
