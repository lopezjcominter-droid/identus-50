// On demand, for Project Setup: preview the digest or send a test to yourself.
// POST { action: 'preview' | 'test', projectId } with the user's Bearer token.
import { rest, loadSettings, buildDigest, recipientsFor, sendEmail } from './digest/core.mjs';
import { normalizeRole } from './ai/roles.mjs';
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
    const settings = await loadSettings(projectId);
    const digest = await buildDigest(projectId, settings, new Date());
    if (body.action === 'preview') return json(200, { subject: digest.subject, html: digest.html, items: digest.count, recipients: (await recipientsFor(projectId, settings)).length });
    if (body.action === 'test') { await sendEmail(me.email, digest.subject, digest.html); return json(200, { ok: true, sentTo: me.email, items: digest.count }); }
    return json(400, { error: 'Unknown action' });
  } catch (error) { return json(500, { error: error.message || 'Unexpected error' }); }
};
