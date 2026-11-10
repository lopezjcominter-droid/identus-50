// "Read now" button (Admin/PM): processes pending AI Knowledge Base pages right
// away instead of waiting for the next 10-minute run.
import { runQueue } from './ai/core.mjs';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kihsukzcbohmxovbyisi.supabase.co';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'POST only' });
  const bearer = request.headers.get('authorization') || ''; const apikey = request.headers.get('apikey') || '';
  if (!/^Bearer\s+\S+/.test(bearer) || !apikey) return json(401, { error: 'Sign in again.' });
  let input = {}; try { input = await request.json(); } catch (_) {}
  const projectId = String(input.projectId || '');
  if (!/^[0-9a-f-]{36}$/i.test(projectId)) return json(400, { error: 'Missing project' });
  const h = { apikey, Authorization: bearer };
  const user = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: h }).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!user?.id) return json(401, { error: 'Sign in again.' });
  const member = await fetch(`${SUPABASE_URL}/rest/v1/project_members?project_id=eq.${projectId}&user_id=eq.${user.id}&select=role`, { headers: h }).then(r => r.json()).catch(() => []);
  if (!['admin', 'pm'].includes(String(member?.[0]?.role || '').toLowerCase())) return json(403, { error: 'Admin and PM only.' });
  try {
    const result = await runQueue(15000);
    return json(200, { ok: true, result });
  } catch (error) { return json(500, { error: error.message }); }
};
