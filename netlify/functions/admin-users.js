// Admin-only user management for the Identus 50 app.
// Needs the Netlify environment variable SUPABASE_SERVICE_ROLE_KEY (never put it in the web page).
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kihsukzcbohmxovbyisi.supabase.co';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpaHN1a3pjYm9obXhvdmJ5aXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjEzMjEsImV4cCI6MjEwNTkzNzMyMX0.91APDO6eQ25ZkdOsBXMj_Uhv0EtkfWULn2N5jEfAGZA';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROLES = ['admin', 'inspector', 'viewer'];

const json = (statusCode, obj) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });
const svc = (extra) => ({ apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json', ...(extra || {}) });

async function rest(path, opts) {
  const res = await fetch(SUPABASE_URL + path, opts);
  const text = await res.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch (e) { body = { raw: text }; }
  return { ok: res.ok, status: res.status, body };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST only' });
  if (!SERVICE_KEY) return json(500, { error: 'SUPABASE_SERVICE_ROLE_KEY is not set in Netlify' });

  // 1) Who is calling?
  const token = ((event.headers && (event.headers.authorization || event.headers.Authorization)) || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'Not signed in' });
  const me = await rest('/auth/v1/user', { headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + token } });
  if (!me.ok || !me.body || !me.body.id) return json(401, { error: 'Invalid session' });
  const myId = me.body.id;

  // 2) Must be an admin
  const prof = await rest(`/rest/v1/profiles?user_id=eq.${myId}&select=role`, { headers: svc() });
  if (!prof.ok || !prof.body || !prof.body[0] || prof.body[0].role !== 'admin') return json(403, { error: 'Admins only' });

  let req; try { req = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Bad JSON' }); }
  const action = req.action;

  const adminCount = async () => {
    const r = await rest('/rest/v1/profiles?role=eq.admin&select=user_id', { headers: svc() });
    return Array.isArray(r.body) ? r.body.length : 0;
  };

  try {
    if (action === 'list') {
      const u = await rest('/auth/v1/admin/users?per_page=200', { headers: svc() });
      if (!u.ok) return json(500, { error: 'Could not list users' });
      const p = await rest('/rest/v1/profiles?select=user_id,name,role', { headers: svc() });
      const map = new Map((p.body || []).map(x => [x.user_id, x]));
      const users = (u.body.users || []).map(x => ({
        id: x.id, email: x.email,
        name: (map.get(x.id) || {}).name || (x.user_metadata && x.user_metadata.name) || '',
        role: (map.get(x.id) || {}).role || null,
        disabled: !!(x.banned_until && new Date(x.banned_until) > new Date()),
        last_sign_in_at: x.last_sign_in_at
      }));
      return json(200, { users, me: myId });
    }

    if (action === 'create') {
      const email = String(req.email || '').trim().toLowerCase();
      const password = String(req.password || '');
      const name = String(req.name || '').trim();
      const role = req.role;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { error: 'Invalid email' });
      if (password.length < 8) return json(400, { error: 'Password must have at least 8 characters' });
      if (!name) return json(400, { error: 'Name is required' });
      if (!ROLES.includes(role)) return json(400, { error: 'Invalid role' });
      const c = await rest('/auth/v1/admin/users', { method: 'POST', headers: svc(), body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } }) });
      if (!c.ok) return json(400, { error: (c.body && (c.body.msg || c.body.message || c.body.error_description)) || 'Could not create user' });
      const pr = await rest('/rest/v1/profiles', { method: 'POST', headers: svc({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ user_id: c.body.id, name, role }) });
      if (!pr.ok) return json(500, { error: 'User created but the profile failed: ' + JSON.stringify(pr.body) });
      return json(200, { ok: true, id: c.body.id });
    }

    if (action === 'setRole') {
      if (!ROLES.includes(req.role)) return json(400, { error: 'Invalid role' });
      if (req.id === myId && req.role !== 'admin') return json(400, { error: 'You cannot remove your own admin role' });
      const cur = await rest(`/rest/v1/profiles?user_id=eq.${req.id}&select=role`, { headers: svc() });
      if (cur.body && cur.body[0] && cur.body[0].role === 'admin' && req.role !== 'admin' && (await adminCount()) < 2) return json(400, { error: 'There must be at least one admin' });
      const r = await rest(`/rest/v1/profiles?user_id=eq.${req.id}`, { method: 'PATCH', headers: svc({ Prefer: 'return=minimal' }), body: JSON.stringify({ role: req.role }) });
      return r.ok ? json(200, { ok: true }) : json(500, { error: 'Could not change role' });
    }

    if (action === 'setName') {
      const name = String(req.name || '').trim(); if (!name) return json(400, { error: 'Name is required' });
      const r = await rest(`/rest/v1/profiles?user_id=eq.${req.id}`, { method: 'PATCH', headers: svc({ Prefer: 'return=minimal' }), body: JSON.stringify({ name }) });
      return r.ok ? json(200, { ok: true }) : json(500, { error: 'Could not change name' });
    }

    if (action === 'setActive') {
      if (req.id === myId) return json(400, { error: 'You cannot disable yourself' });
      const r = await rest(`/auth/v1/admin/users/${req.id}`, { method: 'PUT', headers: svc(), body: JSON.stringify({ ban_duration: req.active ? 'none' : '876000h' }) });
      return r.ok ? json(200, { ok: true }) : json(500, { error: 'Could not change status' });
    }

    if (action === 'resetPassword') {
      const password = String(req.password || '');
      if (password.length < 8) return json(400, { error: 'Password must have at least 8 characters' });
      const r = await rest(`/auth/v1/admin/users/${req.id}`, { method: 'PUT', headers: svc(), body: JSON.stringify({ password }) });
      return r.ok ? json(200, { ok: true }) : json(500, { error: 'Could not reset password' });
    }

    return json(400, { error: 'Unknown action' });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
