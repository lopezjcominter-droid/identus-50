// One role vocabulary for every Netlify function: admin, pm, inspector, viewer.
// Legacy values (supervisor, project manager, qa inspector…) map to these.
export function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (['supervisor', 'project manager', 'projectmanager', 'project lead', 'pm'].includes(role)) return 'pm';
  if (role === 'administrator') return 'admin';
  if (role === 'qa inspector' || role === 'inspection') return 'inspector';
  if (role === 'read only' || role === 'readonly') return 'viewer';
  return role;
}
