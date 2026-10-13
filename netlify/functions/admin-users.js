// Admin-only user management for Identus 50.
// SUPABASE_SERVICE_ROLE_KEY must exist only in Netlify environment variables.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kihsukzcbohmxovbyisi.supabase.co';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROLES = ['admin', 'pm', 'inspector', 'viewer'];

// Keep role values stable across old profiles, browser form values, and
// project memberships. The UI displays friendly labels, but the database and
// API always receive one of the four canonical values above.
function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (role === 'supervisor' || role === 'project manager' || role === 'projectmanager' || role === 'project lead' || role === 'pm') return 'pm';
  if (role === 'administrator') return 'admin';
  if (role === 'qa inspector' || role === 'inspection') return 'inspector';
  if (role === 'read only' || role === 'readonly') return 'viewer';
  return role;
}

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(obj)
});
const serviceHeaders = (extra) => ({
  apikey: SERVICE_KEY,
  Authorization: 'Bearer ' + SERVICE_KEY,
  'Content-Type': 'application/json',
  ...(extra || {})
});

async function rest(path, opts) {
  const response = await fetch(SUPABASE_URL + path, opts);
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch (_) { body = { raw: text }; }
  return { ok: response.ok, status: response.status, body };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST only' });
  if (!SERVICE_KEY || !ANON_KEY) return json(500, { error: 'Supabase server configuration is incomplete.' });

  const rawAuth = event.headers && (event.headers.authorization || event.headers.Authorization);
  const token = String(rawAuth || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json(401, { error: 'Not signed in' });

  const me = await rest('/auth/v1/user', { headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + token } });
  if (!me.ok || !me.body || !me.body.id) return json(401, { error: 'Invalid session' });
  const myId = me.body.id;
  const profile = await rest(`/rest/v1/profiles?user_id=eq.${encodeURIComponent(myId)}&select=role`, { headers: serviceHeaders() });
  const myRole = profile.body && profile.body[0] && profile.body[0].role;
  if (!profile.ok || !['admin'].includes(myRole)) return json(403, { error: 'Admins only' });

  let req;
  try { req = JSON.parse(event.body || '{}'); } catch (_) { return json(400, { error: 'Bad JSON' }); }
  const action = req.action;

  try {
    if (action === 'list') {
      const authUsers = await rest('/auth/v1/admin/users?per_page=200', { headers: serviceHeaders() });
      if (!authUsers.ok) return json(500, { error: 'Could not list users' });
      const profiles = await rest('/rest/v1/profiles?select=user_id,name,role', { headers: serviceHeaders() });
      const byId = new Map((profiles.body || []).map(p => [p.user_id, p]));
      const users = (authUsers.body && authUsers.body.users || []).map(u => {
        const p = byId.get(u.id) || {};
        const role = normalizeRole(p.role);
        return { id: u.id, email: u.email, name: p.name || (u.user_metadata && u.user_metadata.name) || '', role, disabled: !!(u.banned_until && new Date(u.banned_until) > new Date()), last_sign_in_at: u.last_sign_in_at };
      });
      let memberships = [];
      if (reqProjectId(req)) {
        const memberRes = await rest(`/rest/v1/project_members?project_id=eq.${encodeURIComponent(reqProjectId(req))}&select=user_id,role`, { headers: serviceHeaders() });
        if (!memberRes.ok) return json(500, { error: 'Could not list project access' });
        memberships = memberRes.body || [];
      }
      return json(200, { users, memberships, me: myId });
    }

    if (action === 'create') {
      const email = String(req.email || '').trim().toLowerCase();
      const password = String(req.password || '');
      const name = String(req.name || '').trim();
      const role = normalizeRole(req.role);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { error: 'Invalid email' });
      if (password.length < 8) return json(400, { error: 'Password must have at least 8 characters' });
      if (!name) return json(400, { error: 'Name is required' });
      if (!ROLES.includes(role)) return json(400, { error: 'Invalid role' });
      const created = await rest('/auth/v1/admin/users', { method: 'POST', headers: serviceHeaders(), body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } }) });
      if (!created.ok) return json(400, { error: (created.body && (created.body.msg || created.body.message || created.body.error_description)) || 'Could not create user' });
      const saved = await rest('/rest/v1/profiles', { method: 'POST', headers: serviceHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ user_id: created.body.id, name, role }) });
      if (!saved.ok) return json(500, { error: 'User created but the profile could not be saved.' });
      if (reqProjectId(req)) {
        const memberSaved = await rest('/rest/v1/project_members', { method: 'POST', headers: serviceHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ project_id: reqProjectId(req), user_id: created.body.id, role }) });
        if (!memberSaved.ok) return json(500, { error: 'User created but project access could not be saved.' });
      }
      return json(200, { ok: true, id: created.body.id });
    }

    if (action === 'setMembership') {
      const projectId = reqProjectId(req);
      const userId = String(req.userId || '').trim();
      const role = normalizeRole(req.role);
      if (!projectId || !userId) return json(400, { error: 'Project and user are required' });
      if (userId === myId && role !== 'admin') return json(400, { error: 'You cannot remove your own admin project access' });
      if (role === 'none') {
        const removed = await rest(`/rest/v1/project_members?project_id=eq.${encodeURIComponent(projectId)}&user_id=eq.${encodeURIComponent(userId)}`, { method: 'DELETE', headers: serviceHeaders() });
        return removed.ok ? json(200, { ok: true }) : json(500, { error: 'Could not remove project access' });
      }
      if (!ROLES.includes(role)) return json(400, { error: 'Invalid project role' });
      const saved = await rest('/rest/v1/project_members', { method: 'POST', headers: serviceHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ project_id: projectId, user_id: userId, role }) });
      return saved.ok ? json(200, { ok: true }) : json(500, { error: 'Could not update project access' });
    }

    if (action === 'setRole') {
      const role = normalizeRole(req.role);
      if (!ROLES.includes(role)) return json(400, { error: 'Invalid role' });
      if (req.id === myId && role !== 'admin') return json(400, { error: 'You cannot remove your own admin role' });
      const current = await rest(`/rest/v1/profiles?user_id=eq.${encodeURIComponent(req.id)}&select=role`, { headers: serviceHeaders() });
      const adminCountRes = await rest('/rest/v1/profiles?role=eq.admin&select=user_id', { headers: serviceHeaders() });
      if (current.body && current.body[0] && current.body[0].role === 'admin' && role !== 'admin' && (adminCountRes.body || []).length < 2) return json(400, { error: 'There must be at least one admin' });
      const updated = await rest(`/rest/v1/profiles?user_id=eq.${encodeURIComponent(req.id)}`, { method: 'PATCH', headers: serviceHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify({ role }) });
      return updated.ok ? json(200, { ok: true }) : json(500, { error: 'Could not change role' });
    }

    if (action === 'setActive') {
      if (req.id === myId) return json(400, { error: 'You cannot disable yourself' });
      const updated = await rest(`/auth/v1/admin/users/${encodeURIComponent(req.id)}`, { method: 'PUT', headers: serviceHeaders(), body: JSON.stringify({ ban_duration: req.active ? 'none' : '876000h' }) });
      return updated.ok ? json(200, { ok: true }) : json(500, { error: 'Could not change status' });
    }

    if (action === 'resetPassword') {
      const password = String(req.password || '');
      if (password.length < 8) return json(400, { error: 'Password must have at least 8 characters' });
      const updated = await rest(`/auth/v1/admin/users/${encodeURIComponent(req.id)}`, { method: 'PUT', headers: serviceHeaders(), body: JSON.stringify({ password }) });
      return updated.ok ? json(200, { ok: true }) : json(500, { error: 'Could not reset password' });
    }

    if (action === 'delete') {
      if (req.id === myId) return json(400, { error: 'You cannot delete yourself' });
      const deleted = await rest(`/auth/v1/admin/users/${encodeURIComponent(req.id)}`, { method: 'DELETE', headers: serviceHeaders() });
      return deleted.ok ? json(200, { ok: true }) : json(500, { error: 'Could not delete user' });
    }
    return json(400, { error: 'Unknown action' });
  } catch (error) {
    return json(500, { error: error.message || 'Unexpected server error' });
  }
};

function reqProjectId(req) {
  const value = String((req && (req.projectId || req.project_id)) || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : '';
}
