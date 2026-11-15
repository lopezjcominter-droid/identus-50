// Identus 50 · Projects (Procore-style)
// - Project switcher: search, current/recent first, Active / Archived
// - New project: details, copy setup from another project, team and roles
// - Project details: client, GC, permit, dates, logo (used in reports)
// - Archive / restore a finished project (data is kept)
// - Portfolio: every project side by side (admin)
(function () {
  'use strict';
  const isLocal = () => (typeof LOCAL_PROJECT_MODE !== 'undefined' && LOCAL_PROJECT_MODE) || location.protocol === 'file:';
  const client = () => (typeof sbClient !== 'undefined' ? sbClient : null);
  const e = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isAdmin = () => window.userRole === 'admin' || isLocal();
  const canManage = r => isAdmin() || (r && r.my_role === 'pm');
  const archived = r => /^archived$/i.test(String(r.status || ''));
  const deleted = r => /^deleted$/i.test(String(r.status || ''));
  const tabOf = r => deleted(r) ? 'deleted' : archived(r) ? 'archived' : 'active';
  const LOGO_BUCKET = 'identus-files';
  const logoUrl = path => {
    if (!path) return '';
    if (/^https?:|^data:/.test(path)) return path;
    try { return client().storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl; } catch (_) { return ''; }
  };
  const fmtDate = d => d ? new Date(String(d).slice(0, 10) + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const overlay = (id, inner, width = 720) => {
    const ov = document.createElement('div'); ov.id = id;
    ov.style.cssText = 'position:fixed;inset:0;z-index:100075;background:rgba(15,23,42,.45);display:flex;align-items:flex-start;justify-content:center;padding:50px 12px 12px;overflow:auto;';
    ov.innerHTML = `<div style="background:#fff;border-radius:12px;width:min(${width}px,100%);max-height:86vh;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,.3);">${inner}</div>`;
    document.body.appendChild(ov);
    return ov;
  };
  async function adminUsers(action, payload = {}) {
    const { data: { session } } = await client().auth.getSession();
    const res = await fetch('/.netlify/functions/admin-users', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session?.access_token || '') }, body: JSON.stringify({ action, ...payload }) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
  }
  async function loadSummary() {
    if (!isLocal() && client()) {
      const { data, error } = await client().rpc('project_picker_summary');
      if (!error && Array.isArray(data)) return data;
    }
    try { await loadSetupProjectSelector(); } catch (_) {}
    return (typeof setupProjectCatalog !== 'undefined' ? setupProjectCatalog : []).map(p => ({ id: p.id, name: p.name, address: p.address, status: p.status || 'active' }));
  }

  // Current project's details for reports (client, GC, permit, dates, logo).
  window.currentProjectInfo = null;
  async function loadCurrentProjectInfo() {
    if (isLocal() || !client()) return;
    for (let i = 0; i < 20 && !window.userRole; i++) await new Promise(r => setTimeout(r, 500));
    try {
      const { data } = await client().from('projects').select('id,name,address,client,contractor,permit_number,start_date,end_date,logo_path,status').eq('id', PROJECT_ID).maybeSingle();
      if (data) window.currentProjectInfo = { ...data, logoUrl: logoUrl(data.logo_path) };
      // A deleted project stays closed for everyone but admins, even from an old link.
      if (data && deleted(data) && window.userRole !== 'admin' && PROJECT_ID !== DEFAULT_PROJECT_ID) {
        alert('This project was deleted. Opening the main project.');
        selectHeaderProject(DEFAULT_PROJECT_ID);
      }
    } catch (_) {}
  }
  // Text lines for report headers (empty fields are left out).
  window.projectReportLines = function () {
    const p = window.currentProjectInfo || {};
    return [p.client && `Client: ${p.client}`, p.contractor && `General Contractor: ${p.contractor}`, p.permit_number && `Permit: ${p.permit_number}`,
      (p.start_date || p.end_date) && `Schedule: ${fmtDate(p.start_date) || '—'} – ${fmtDate(p.end_date) || '—'}`].filter(Boolean);
  };

  // ---------- Project switcher ----------
  async function openProjectPicker() {
    if (document.getElementById('projectPicker')) return;
    const ov = overlay('projectPicker', `
      <div style="padding:14px 16px;border-bottom:1px solid #E5E7EB;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <b style="font-size:16px;color:#0F172A;">Projects</b>
        <input type="search" id="ppSearch" placeholder="Search project, address, client…" autocomplete="off" data-lpignore="true" data-1p-ignore="true" style="flex:1;min-width:160px;padding:8px 10px;border:1px solid #CBD5E1;border-radius:6px;font-size:14px;">
        <button type="button" id="ppClose" aria-label="Close" style="border:none;background:none;font-size:20px;cursor:pointer;color:#64748B;">✕</button>
        <div id="ppTabs" style="flex-basis:100%;display:flex;gap:6px;"></div></div>
      <div id="ppList" style="overflow:auto;padding:6px 8px;"><p style="color:#64748B;padding:10px;">Loading…</p></div>
      <div id="ppFoot" style="padding:10px 16px;border-top:1px solid #E5E7EB;display:flex;gap:8px;justify-content:space-between;align-items:center;font-size:12px;color:#64748B;flex-wrap:wrap;"></div>`);
    let active = -1, tab = 'active';
    const onKey = ev => {
      const items = [...ov.querySelectorAll('[data-pid]')];
      if (ev.key === 'Escape') { close(); return; }
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); active = Math.max(0, Math.min(items.length - 1, active + (ev.key === 'ArrowDown' ? 1 : -1))); items.forEach((b, i) => { b.style.boxShadow = i === active ? '0 0 0 2px #1D4ED8' : ''; }); items[active]?.scrollIntoView({ block: 'nearest' }); }
      if (ev.key === 'Enter' && document.activeElement?.id === 'ppSearch' && items[Math.max(0, active)]) { ev.preventDefault(); items[Math.max(0, active)].click(); }
    };
    const close = () => { document.removeEventListener('keydown', onKey); ov.remove(); };
    ov.querySelector('#ppClose').onclick = close; ov.addEventListener('click', ev => { if (ev.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    if (!window.matchMedia('(pointer: coarse)').matches) setTimeout(() => ov.querySelector('#ppSearch')?.focus(), 50);
    const rows = await loadSummary();
    if (!ov.isConnected) return;
    let recent = []; try { recent = JSON.parse(localStorage.getItem('recent_projects') || '[]'); } catch (_) {}
    const rankOf = r => r.id === PROJECT_ID ? -1 : (recent.indexOf(r.id) >= 0 ? recent.indexOf(r.id) : 999);
    rows.sort((a, b) => rankOf(a) - rankOf(b) || String(a.name || '').localeCompare(String(b.name || '')));
    const when = t => { if (!t) return 'No activity yet'; const d = Math.floor((Date.now() - Date.parse(t)) / 86400000); return d <= 0 ? 'Active today' : d === 1 ? 'Active yesterday' : `Active ${d} days ago`; };
    if (!isAdmin()) for (let i = rows.length - 1; i >= 0; i--) if (deleted(rows[i])) rows.splice(i, 1);
    const counts = { active: rows.filter(r => tabOf(r) === 'active').length, archived: rows.filter(r => tabOf(r) === 'archived').length, deleted: rows.filter(r => tabOf(r) === 'deleted').length };
    const drawTabs = () => {
      ov.querySelector('#ppTabs').innerHTML = ['active', 'archived', ...(counts.deleted ? ['deleted'] : [])].map(k => `<button type="button" data-tab="${k}" style="padding:4px 12px;border-radius:14px;border:1px solid ${tab === k ? '#1D4ED8' : '#CBD5E1'};background:${tab === k ? '#1D4ED8' : '#fff'};color:${tab === k ? '#fff' : '#334155'};font-size:12px;font-weight:600;cursor:pointer;">${({ active: 'Active', archived: 'Archived', deleted: 'Deleted' })[k]} (${counts[k]})</button>`).join('');
      ov.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; drawTabs(); draw(ov.querySelector('#ppSearch').value.trim().toLowerCase()); });
    };
    const card = r => {
      const current = r.id === PROJECT_ID; const pct = Number(r.progress || 0); const hasStats = r.units != null; const empty = hasStats && !Number(r.units);
      const logo = logoUrl(r.logo_path);
      const initials = String(r.name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const meta = [r.client && `Client: ${e(r.client)}`, r.contractor && `GC: ${e(r.contractor)}`, r.permit_number && `Permit ${e(r.permit_number)}`].filter(Boolean).join(' · ');
      return `<div data-card="${e(r.id)}" style="display:flex;align-items:center;gap:6px;margin:2px 0;">
        <button type="button" data-pid="${e(r.id)}" style="display:flex;flex:1;min-width:0;text-align:left;gap:12px;align-items:center;padding:12px;border:1px solid ${current ? '#93C5FD' : 'transparent'};background:${current ? '#EFF6FF' : '#fff'};border-radius:8px;cursor:pointer;${archived(r) ? 'opacity:.75;' : ''}">
          ${logo ? `<img src="${e(logo)}" alt="" style="width:40px;height:40px;border-radius:8px;object-fit:contain;background:#F8FAFC;border:1px solid #E2E8F0;flex-shrink:0;">` : `<div style="width:40px;height:40px;border-radius:8px;background:${archived(r) ? '#94A3B8' : '#1E40AF'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">${e(initials)}</div>`}
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;color:#0F172A;font-size:14px;">${e(r.name)}${current ? ' <span style="font-size:11px;font-weight:600;color:#1D4ED8;background:#DBEAFE;padding:1px 7px;border-radius:9px;margin-left:4px;">Current</span>' : ''}${archived(r) ? ' <span style="font-size:11px;font-weight:600;color:#475569;background:#E2E8F0;padding:1px 7px;border-radius:9px;margin-left:4px;">Archived</span>' : ''}${deleted(r) ? ' <span style="font-size:11px;font-weight:600;color:#B91C1C;background:#FEE2E2;padding:1px 7px;border-radius:9px;margin-left:4px;">Deleted</span>' : ''}</div>
            <div style="font-size:12px;color:#64748B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📍 ${e(r.address || 'No address')}</div>
            ${meta ? `<div style="font-size:11px;color:#475569;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${meta}</div>` : ''}
            ${empty ? `<div style="font-size:11px;color:#B45309;margin-top:3px;">Not set up yet — open it and use Project Setup to add buildings and units${r.my_role ? ` · Your role: <b>${e(r.my_role)}</b>` : ''}</div>` : ''}
            ${hasStats && !empty ? `<div style="font-size:11px;color:#475569;margin-top:3px;">${Number(r.buildings || 0)} buildings · ${Number(r.units || 0)} units · ${Number(r.completed_units || 0)} completed · ${when(r.last_activity)}${r.my_role ? ` · Your role: <b>${e(r.my_role)}</b>` : ''}</div>` : ''}
          </div>
          ${hasStats && !empty ? `<div style="width:84px;flex-shrink:0;text-align:right;"><div style="font-size:15px;font-weight:700;color:#0F172A;">${pct}%</div><div style="height:6px;background:#E2E8F0;border-radius:3px;margin-top:4px;"><div style="height:6px;width:${Math.min(100, pct)}%;background:${pct >= 100 ? '#059669' : '#2563EB'};border-radius:3px;"></div></div></div>` : ''}
        </button>
        ${canManage(r) && !isLocal() ? `<button type="button" data-menu="${e(r.id)}" title="Project details" aria-label="Project details" style="border:1px solid #E2E8F0;background:#fff;border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:16px;flex-shrink:0;">⋯</button>` : ''}
      </div>`;
    };
    const draw = q => {
      const shown = rows.filter(r => tabOf(r) === tab).filter(r => !q || `${r.name} ${r.address} ${r.client || ''} ${r.contractor || ''} ${r.permit_number || ''}`.toLowerCase().includes(q));
      ov.querySelector('#ppList').innerHTML = shown.length ? shown.map(card).join('') : `<p style="color:#64748B;padding:10px;">${tab === 'active' ? 'No projects found.' : `No ${tab} projects.`}</p>`;
      active = -1;
      ov.querySelectorAll('[data-pid]').forEach(b => b.onclick = () => {
        const pid = b.dataset.pid; if (pid === PROJECT_ID) { close(); return; }
        try { localStorage.setItem('recent_projects', JSON.stringify([pid, ...recent.filter(x => x !== pid)].slice(0, 8))); } catch (_) {}
        ov.querySelectorAll('[data-pid]').forEach(x => { x.disabled = true; x.style.opacity = x === b ? '1' : '.45'; });
        b.insertAdjacentHTML('beforeend', '<span style="font-size:12px;color:#1D4ED8;font-weight:600;flex-shrink:0;">Opening…</span>');
        selectHeaderProject(pid);
      });
      ov.querySelectorAll('[data-menu]').forEach(b => b.onclick = () => { const r = rows.find(x => x.id === b.dataset.menu); close(); openProjectDetails(r); });
    };
    drawTabs(); draw('');
    ov.querySelector('#ppFoot').innerHTML = `<span>${rows.length} project${rows.length === 1 ? '' : 's'}</span><span style="display:flex;gap:8px;">${isAdmin() && !isLocal() ? '<button type="button" id="ppPortfolio" style="padding:7px 12px;border:1px solid #CBD5E1;background:#fff;color:#0F172A;border-radius:6px;cursor:pointer;font-weight:600;">📊 Portfolio</button>' : ''}${isAdmin() ? '<button type="button" id="ppNew" style="padding:7px 12px;border:none;background:#1D4ED8;color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">＋ New project</button>' : ''}</span>`;
    if (ov.querySelector('#ppNew')) ov.querySelector('#ppNew').onclick = () => { close(); createNewProject(rows); };
    if (ov.querySelector('#ppPortfolio')) ov.querySelector('#ppPortfolio').onclick = () => { close(); openPortfolio(rows); };
    const search = ov.querySelector('#ppSearch'); search.oninput = () => draw(search.value.trim().toLowerCase());
  }

  // ---------- Project details (edit, logo, archive) ----------
  const field = (id, label, value = '', type = 'text', extra = '') => `<label style="display:block;font-size:12px;font-weight:600;color:#334155;margin:0 0 3px;">${label}</label><input id="${id}" type="${type}" value="${e(value)}" autocomplete="off" data-lpignore="true" data-1p-ignore="true" ${extra} style="width:100%;padding:9px;border:1px solid #CBD5E1;border-radius:6px;box-sizing:border-box;margin-bottom:10px;font-size:14px;">`;
  function openProjectDetails(r) {
    if (!r) return;
    const ov = overlay('projectDetails', `
      <form style="padding:18px 20px;overflow:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><b style="font-size:16px;">Project details</b><button type="button" id="pdClose" style="border:none;background:none;font-size:20px;cursor:pointer;color:#64748B;">✕</button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px;">
          <div style="grid-column:1/-1">${field('pdName', 'Project name', r.name, 'text', 'required minlength="2"')}</div>
          <div style="grid-column:1/-1">${field('pdAddress', 'Address', r.address)}</div>
          <div>${field('pdClient', 'Client / Owner', r.client)}</div>
          <div>${field('pdGc', 'General Contractor', r.contractor)}</div>
          <div>${field('pdPermit', 'Permit number', r.permit_number)}</div>
          <div></div>
          <div>${field('pdStart', 'Start date', r.start_date ? String(r.start_date).slice(0, 10) : '', 'date')}</div>
          <div>${field('pdEnd', 'End date', r.end_date ? String(r.end_date).slice(0, 10) : '', 'date')}</div>
        </div>
        <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin:0 0 3px;">Logo (shown on reports)</label>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;"><img id="pdLogoPreview" src="${e(logoUrl(r.logo_path))}" alt="" style="width:56px;height:56px;object-fit:contain;border:1px solid #E2E8F0;border-radius:8px;background:#F8FAFC;${r.logo_path ? '' : 'display:none;'}"><input type="file" id="pdLogo" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="font-size:12px;"></div>
        ${isAdmin() && r.units != null && !Number(r.units) ? `<div style="border:1px dashed #93C5FD;background:#EFF6FF;border-radius:8px;padding:10px;margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:#1E3A8A;margin-bottom:6px;">This project is not set up yet</div><div style="display:flex;gap:8px;flex-wrap:wrap;"><select id="pdCopyFrom" style="flex:1;min-width:160px;padding:7px;border:1px solid #CBD5E1;border-radius:6px;font-size:13px;"><option value="">Copy setup from…</option></select><button type="button" id="pdCopyBtn" style="padding:7px 12px;border:none;background:#1D4ED8;color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Copy</button></div><div style="font-size:11px;color:#475569;margin-top:6px;">Buildings/floors layout, systems and QC unit models. No progress or photos.</div></div>` : ''}
        <div id="pdMsg" style="min-height:16px;font-size:12px;color:#B91C1C;margin-bottom:8px;"></div>
        <div style="display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;">
          ${isAdmin() ? `<span style="display:flex;gap:8px;flex-wrap:wrap;">${deleted(r) ? '' : `<button type="button" id="pdArchive" style="padding:8px 12px;border:1px solid ${archived(r) ? '#059669' : '#64748B'};color:${archived(r) ? '#047857' : '#334155'};background:#fff;border-radius:6px;cursor:pointer;font-weight:600;">${archived(r) ? 'Restore project' : 'Archive'}</button>`}${deleted(r) ? '<button type="button" id="pdUndelete" style="padding:8px 12px;border:1px solid #059669;color:#047857;background:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Restore deleted project</button>' : (r.id === DEFAULT_PROJECT_ID ? '' : '<button type="button" id="pdDelete" style="padding:8px 12px;border:1px solid #DC2626;color:#B91C1C;background:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Delete…</button>')}</span>` : '<span></span>'}
          <span style="display:flex;gap:8px;"><button type="button" id="pdCancel" style="padding:8px 14px;border:1px solid #CBD5E1;background:#fff;border-radius:6px;cursor:pointer;">Cancel</button><button type="submit" id="pdSave" style="padding:8px 14px;border:none;background:#1D4ED8;color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Save</button></span>
        </div></form>`, 560);
    const $ = id => ov.querySelector('#' + id);
    const close = () => ov.remove();
    $('pdClose').onclick = close; $('pdCancel').onclick = close;
    $('pdLogo').onchange = () => { const f = $('pdLogo').files[0]; if (f) { $('pdLogoPreview').src = URL.createObjectURL(f); $('pdLogoPreview').style.display = ''; } };
    if ($('pdCopyFrom')) {
      loadSummary().then(list => { const sel = $('pdCopyFrom'); if (!sel) return; list.filter(x => x.id !== r.id && Number(x.units)).forEach(x => sel.insertAdjacentHTML('beforeend', `<option value="${e(x.id)}">${e(x.name)}</option>`)); });
      $('pdCopyBtn').onclick = async () => {
        const from = $('pdCopyFrom').value; if (!from) { $('pdMsg').textContent = 'Choose the project to copy from.'; return; }
        $('pdCopyBtn').disabled = true; $('pdCopyBtn').textContent = 'Copying…';
        const done = [];
        try { await copyProjectSetup(from, r.id, done); $('pdMsg').style.color = '#047857'; $('pdMsg').textContent = done.length ? `Copied: ${done.join(', ')}. Open the project and press Apply in Project Setup to create its buildings and units.` : 'The source project has no setup to copy.'; }
        catch (err) { $('pdMsg').style.color = '#B91C1C'; $('pdMsg').textContent = err.message || String(err); }
        $('pdCopyBtn').disabled = false; $('pdCopyBtn').textContent = 'Copy';
      };
    }
    if ($('pdDelete')) $('pdDelete').onclick = () => { close(); deleteProject(r); };
    if ($('pdUndelete')) $('pdUndelete').onclick = async () => {
      const { error } = await client().from('projects').update({ status: 'Active' }).eq('id', r.id);
      if (error) { $('pdMsg').textContent = error.message; return; }
      close(); if (typeof toast === 'function') toast('Project restored'); openProjectPicker();
    };
    if ($('pdArchive')) $('pdArchive').onclick = async () => {
      const toArchive = !archived(r);
      if (toArchive && !confirm(`Archive “${r.name}”?\n\nIt leaves the project list, but all its data, photos and reports are kept. You can restore it any time from the Archived tab.`)) return;
      const { error } = await client().from('projects').update({ status: toArchive ? 'Archived' : 'Active' }).eq('id', r.id);
      if (error) { $('pdMsg').textContent = error.message; return; }
      close(); if (typeof toast === 'function') toast(toArchive ? 'Project archived' : 'Project restored');
      if (r.id === PROJECT_ID && toArchive) selectHeaderProject(DEFAULT_PROJECT_ID); else openProjectPicker();
    };
    ov.querySelector('form').onsubmit = async ev => {
      ev.preventDefault();
      const name = $('pdName').value.trim();
      if (name.length < 2) { $('pdMsg').textContent = 'Enter the project name.'; return; }
      $('pdSave').disabled = true; $('pdSave').textContent = 'Saving…';
      try {
        const update = { name, address: $('pdAddress').value.trim(), client: $('pdClient').value.trim() || null, contractor: $('pdGc').value.trim() || null, permit_number: $('pdPermit').value.trim() || null, start_date: $('pdStart').value || null, end_date: $('pdEnd').value || null };
        const file = $('pdLogo').files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) throw new Error('The logo must be under 2 MB.');
          const path = `logos/${r.id}/logo-${Date.now()}.${(file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          const { error: upErr } = await client().storage.from(LOGO_BUCKET).upload(path, file, { contentType: file.type, upsert: true });
          if (upErr) throw upErr;
          update.logo_path = path;
        }
        const { error } = await client().from('projects').update(update).eq('id', r.id);
        if (error) throw error;
        close();
        if (r.id === PROJECT_ID) {
          try { sharedProject = { name: update.name, address: update.address }; applyProjectName(); } catch (_) {}
          await loadCurrentProjectInfo();
        }
        if (typeof toast === 'function') toast('✅ Project details saved');
        openProjectPicker();
      } catch (err) { $('pdMsg').textContent = err.message || String(err); $('pdSave').disabled = false; $('pdSave').textContent = 'Save'; }
    };
  }

  // ---------- New project ----------
  async function copyStorageTree(bucket, value, fromId, toId) {
    // Copy every file of the source project referenced in value; return value
    // with the new paths, so deleting a drawing in one project never affects the other.
    if (typeof value === 'string') {
      if (!value.startsWith(`${fromId}/`)) return value;
      const target = `${toId}/${value.slice(fromId.length + 1)}`;
      const { error } = await client().storage.from(bucket).copy(value, target);
      if (error && !/exists/i.test(error.message || '')) throw error;
      return target;
    }
    if (Array.isArray(value)) return Promise.all(value.map(v => copyStorageTree(bucket, v, fromId, toId)));
    if (value && typeof value === 'object') { const out = {}; for (const [k, v] of Object.entries(value)) out[k] = await copyStorageTree(bucket, v, fromId, toId); return out; }
    return value;
  }
  async function copyProjectSetup(fromId, toId, report) {
    const { data: setup } = await client().from('project_setup_config').select('*').eq('project_id', fromId).maybeSingle();
    if (setup) {
      const row = { ...setup, project_id: toId, updated_at: new Date().toISOString() };
      const { error } = await client().from('project_setup_config').upsert(row, { onConflict: 'project_id' });
      if (error) throw new Error(`Setup: ${error.message}`); report.push('buildings and floors layout');
    }
    const { data: templates } = await client().from('quantity_templates').select('*').eq('project_id', fromId).eq('is_active', true);
    if (templates?.length) {
      const rows = [];
      for (const t of templates) {
        const row = { ...t, project_id: toId };
        delete row.id; delete row.created_at; delete row.updated_at;
        row.storage_path = await copyStorageTree(QUANTITY_STORAGE_BUCKET, row.storage_path, fromId, toId);
        if (row.system_drawings) row.system_drawings = await copyStorageTree(QUANTITY_STORAGE_BUCKET, row.system_drawings, fromId, toId);
        rows.push(row);
      }
      const { error } = await client().from('quantity_templates').insert(rows);
      if (error) throw new Error(`QC models: ${error.message}`); report.push(`${rows.length} QC unit model(s) with checklists`);
    }
  }
  // After creating: Open it, or Undo (deletes it again) during 2 minutes.
  function showCreatedBar(project, done, warnings) {
    document.getElementById('projectCreatedBar')?.remove();
    const bar = document.createElement('div'); bar.id = 'projectCreatedBar';
    bar.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:100090;background:#0F172A;color:#fff;border-radius:10px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.35);display:flex;gap:10px;align-items:center;flex-wrap:wrap;max-width:calc(100% - 24px);font-size:13px;';
    bar.innerHTML = `<span style="flex:1;min-width:180px;">✅ Project <b>${e(project.name)}</b> created.${done.length ? ` Copied/added: ${e(done.join(', '))}.` : ''}${warnings.length ? `<br><span style="color:#FCA5A5;">Not completed: ${e(warnings.join(' · '))}</span>` : ''}</span>
      <button type="button" id="pcbOpen" style="padding:6px 12px;border:none;border-radius:6px;background:#3B82F6;color:#fff;font-weight:600;cursor:pointer;">Open</button>
      <button type="button" id="pcbUndo" style="padding:6px 12px;border:1px solid #fff;border-radius:6px;background:transparent;color:#fff;font-weight:600;cursor:pointer;">Undo</button>
      <button type="button" id="pcbClose" style="border:none;background:none;color:#94A3B8;font-size:16px;cursor:pointer;">✕</button>`;
    document.body.appendChild(bar);
    const timer = setTimeout(() => bar.remove(), 120000);
    bar.querySelector('#pcbClose').onclick = () => { clearTimeout(timer); bar.remove(); };
    bar.querySelector('#pcbOpen').onclick = () => { clearTimeout(timer); bar.remove(); selectHeaderProject(project.id); };
    bar.querySelector('#pcbUndo').onclick = async () => {
      bar.querySelector('#pcbUndo').disabled = true; bar.querySelector('#pcbUndo').textContent = 'Undoing…';
      try {
        if (isLocal()) { let c = []; try { c = JSON.parse(localStorage.getItem('local_project_catalog') || '[]'); } catch (_) {} localStorage.setItem('local_project_catalog', JSON.stringify(c.filter(p => p.id !== project.id))); }
        else await hardDeleteEmptyProject(project.id);
        clearTimeout(timer); bar.remove(); if (typeof toast === 'function') toast(`“${project.name}” was removed`);
        try { setupProjectCatalogRequest = null; await loadSetupProjectSelector(); } catch (_) {}
      } catch (err) { bar.querySelector('#pcbUndo').textContent = 'Undo failed'; alert(err.message || err); }
    };
  }
  async function createNewProject(knownRows) {
    if (!isAdmin()) { alert('Only an admin can create projects.'); return; }
    const sources = (knownRows || await loadSummary()).filter(r => tabOf(r) === 'active');
    let users = [];
    if (!isLocal()) { try { users = (await adminUsers('list', { projectId: PROJECT_ID })).users || []; } catch (_) {} }
    users = users.filter(u => !u.disabled && u.role !== 'admin').sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email)));
    const ov = overlay('newProject', `
      <form style="padding:18px 20px;overflow:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><b style="font-size:16px;">＋ New project</b><button type="button" id="npClose" style="border:none;background:none;font-size:20px;cursor:pointer;color:#64748B;">✕</button></div>
        <p style="font-size:12px;color:#64748B;margin:0 0 12px;">The current project is not changed. The project ID is created automatically.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px;">
          <div style="grid-column:1/-1">${field('npName', 'Project name *', '', 'text', 'required minlength="2" placeholder="e.g. EMI on 50"')}</div>
          <div style="grid-column:1/-1">${field('npAddress', 'Address', '', 'text', 'placeholder="Street, city"')}</div>
          <div>${field('npClient', 'Client / Owner')}</div><div>${field('npGc', 'General Contractor')}</div>
          <div>${field('npPermit', 'Permit number')}</div><div></div>
          <div>${field('npStart', 'Start date', '', 'date')}</div><div>${field('npEnd', 'End date', '', 'date')}</div>
        </div>
        <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin:4px 0 3px;">Start from</label>
        <select id="npCopy" style="width:100%;padding:9px;border:1px solid #CBD5E1;border-radius:6px;margin-bottom:4px;font-size:14px;"><option value="">Blank project</option>${sources.map(s => `<option value="${e(s.id)}">Copy setup from ${e(s.name)}</option>`).join('')}</select>
        <p style="font-size:11px;color:#64748B;margin:0 0 12px;">Copies the buildings/floors layout, systems and QC unit models with checklists. Progress, inspections, punch list and photos are not copied.</p>
        ${isLocal() ? '' : `<label style="display:block;font-size:12px;font-weight:600;color:#334155;margin:0 0 3px;">Team</label>
        <div style="border:1px solid #E2E8F0;border-radius:8px;max-height:220px;overflow:auto;margin-bottom:6px;">${users.length ? users.map(u => `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid #F1F5F9;"><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;">${e(u.name || u.email)}</div><div style="font-size:11px;color:#94A3B8;">${e(u.email)}</div></div><select data-member="${e(u.id)}" style="padding:5px;border:1px solid #CBD5E1;border-radius:6px;font-size:12px;"><option value="none">No access</option><option value="pm">PM</option><option value="inspector">Inspector</option><option value="viewer">Viewer</option></select></div>`).join('') : '<p style="font-size:12px;color:#64748B;padding:8px 10px;margin:0;">No users to add yet.</p>'}</div>
        <p style="font-size:11px;color:#64748B;margin:0 0 12px;">Admins always see every project. Others only see the projects where they have a role.</p>`}
        <div id="npMsg" style="min-height:16px;font-size:12px;color:#B91C1C;margin-bottom:8px;white-space:pre-line;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;"><button type="button" id="npCancel" style="padding:8px 14px;border:1px solid #CBD5E1;background:#fff;border-radius:6px;cursor:pointer;">Cancel</button><button type="submit" id="npSave" style="padding:8px 14px;border:none;background:#1D4ED8;color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Create project</button></div>
      </form>`, 600);
    const $ = id => ov.querySelector('#' + id);
    const close = () => ov.remove();
    $('npClose').onclick = close; $('npCancel').onclick = close;
    setTimeout(() => $('npName').focus(), 50);
    ov.querySelector('form').onsubmit = async ev => {
      ev.preventDefault();
      const name = $('npName').value.trim();
      if (name.length < 2) { $('npMsg').textContent = 'Enter the project name.'; return; }
      if (sources.concat(knownRows || []).some(p => String(p.name || '').trim().toLowerCase() === name.toLowerCase())) { $('npMsg').textContent = 'A project with this name already exists.'; return; }
      const id = crypto.randomUUID ? crypto.randomUUID() : 'local-' + Date.now();
      const project = { id, name, address: $('npAddress').value.trim() };
      const details = { client: $('npClient').value.trim() || null, contractor: $('npGc').value.trim() || null, permit_number: $('npPermit').value.trim() || null, start_date: $('npStart').value || null, end_date: $('npEnd').value || null, status: 'Active' };
      $('npSave').disabled = true; $('npSave').textContent = 'Creating…';
      const done = [], warnings = [];
      try {
        if (isLocal()) {
          let catalog = []; try { catalog = JSON.parse(localStorage.getItem('local_project_catalog') || '[]'); } catch (_) {}
          catalog.push({ ...project, ...details }); localStorage.setItem('local_project_catalog', JSON.stringify(catalog));
        } else {
          const { error } = await client().from('projects').insert({ ...project, ...details });
          if (error) throw error;
          const from = $('npCopy').value;
          if (from) { try { await copyProjectSetup(from, id, done); } catch (err) { warnings.push(`Setup copy: ${err.message}`); } }
          const members = [...ov.querySelectorAll('[data-member]')].filter(s => s.value !== 'none');
          for (const s of members) { try { await adminUsers('setMembership', { projectId: id, userId: s.dataset.member, role: s.value }); } catch (err) { warnings.push(`Team: ${err.message}`); } }
          if (members.length) done.push(`${members.length} team member(s)`);
        }
        close();
        try { setupProjectCatalogRequest = null; await loadSetupProjectSelector(); } catch (_) {}
        showCreatedBar({ id, name }, done, warnings);
      } catch (err) { $('npMsg').textContent = `Could not create the project: ${err.message || err}`; $('npSave').disabled = false; $('npSave').textContent = 'Create project'; }
    };
  }

  // ---------- Delete ----------
  // An empty project (no units yet, e.g. created by mistake) is removed right
  // away. A project with data needs two checks — its exact name and the
  // admin's password — and is only moved to "Deleted" (hidden, all data kept),
  // so it can still be restored.
  async function hardDeleteEmptyProject(id) {
    for (const t of ['quantity_templates', 'quantity_floor_plans', 'project_setup_config', 'notification_settings', 'project_members', 'buildings']) {
      try { await client().from(t).delete().eq('project_id', id); } catch (_) {}
    }
    const { error } = await client().from('projects').delete().eq('id', id);
    if (error) throw error;
  }
  async function deleteProject(r) {
    if (!isAdmin()) return;
    const leaveIfCurrent = () => { if (r.id === PROJECT_ID) selectHeaderProject(DEFAULT_PROJECT_ID); else openProjectPicker(); };
    if (isLocal()) {
      if (!confirm(`Delete “${r.name}”?`)) return;
      let catalog = []; try { catalog = JSON.parse(localStorage.getItem('local_project_catalog') || '[]'); } catch (_) {}
      localStorage.setItem('local_project_catalog', JSON.stringify(catalog.filter(p => p.id !== r.id))); leaveIfCurrent(); return;
    }
    const hasData = Number(r.units || 0) > 0 || Number(r.inspections || 0) > 0 || Number(r.open_issues || 0) > 0;
    if (!hasData) {
      if (!confirm(`Delete the empty project “${r.name}”?\n\nIt has no units or records yet. This cannot be undone.`)) return;
      try { await hardDeleteEmptyProject(r.id); if (typeof toast === 'function') toast('Project deleted'); leaveIfCurrent(); }
      catch (err) { alert(`Could not delete the project: ${err.message || err}`); }
      return;
    }
    const ov = overlay('projectDelete', `
      <form style="padding:18px 20px;">
        <b style="font-size:16px;color:#B91C1C;">Delete “${e(r.name)}”?</b>
        <p style="font-size:13px;color:#334155;margin:8px 0;">This project has data: ${Number(r.units || 0)} units, ${Number(r.inspections || 0)} inspections, ${Number(r.open_issues || 0)} open issues. It will be removed from the project list for everyone. <b>All its data is kept</b> and an admin can restore it from the <b>Deleted</b> tab.</p>
        ${field('pdConfirmName', `Type the project name to confirm: <b>${e(r.name)}</b>`, '', 'text')}
        ${field('pdConfirmPw', 'Your password', '', 'password', 'autocomplete="current-password"')}
        <div id="pdDelMsg" style="min-height:16px;font-size:12px;color:#B91C1C;margin-bottom:8px;"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;"><button type="button" id="pdDelCancel" style="padding:8px 14px;border:1px solid #CBD5E1;background:#fff;border-radius:6px;cursor:pointer;">Cancel</button><button type="submit" id="pdDelGo" style="padding:8px 14px;border:none;background:#DC2626;color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Delete project</button></div>
      </form>`, 460);
    const $ = id => ov.querySelector('#' + id);
    $('pdDelCancel').onclick = () => ov.remove();
    setTimeout(() => $('pdConfirmName').focus(), 50);
    ov.querySelector('form').onsubmit = async ev => {
      ev.preventDefault();
      if ($('pdConfirmName').value.trim() !== String(r.name).trim()) { $('pdDelMsg').textContent = 'The name does not match.'; return; }
      $('pdDelGo').disabled = true; $('pdDelGo').textContent = 'Checking…';
      try {
        const { data: { user } } = await client().auth.getUser();
        const { error: pwErr } = await client().auth.signInWithPassword({ email: user.email, password: $('pdConfirmPw').value });
        if (pwErr) throw new Error('Wrong password.');
        const { error } = await client().from('projects').update({ status: 'Deleted' }).eq('id', r.id);
        if (error) throw error;
        ov.remove(); if (typeof toast === 'function') toast('Project deleted (it can be restored from the Deleted tab)');
        leaveIfCurrent();
      } catch (err) { $('pdDelMsg').textContent = err.message || String(err); $('pdDelGo').disabled = false; $('pdDelGo').textContent = 'Delete project'; }
    };
  }

  // ---------- Portfolio ----------
  async function openPortfolio(knownRows) {
    const rows = (knownRows && knownRows.length && knownRows[0].units !== undefined ? knownRows : await loadSummary()).filter(r => tabOf(r) === 'active');
    const th = 'text-align:left;padding:8px 6px;border-bottom:2px solid #0B5394;position:sticky;top:0;background:#fff;font-size:12px;';
    const td = 'padding:8px 6px;border-bottom:1px solid #F1F5F9;font-size:12px;';
    const warn = (n, color) => Number(n) ? `<b style="color:${color};">${Number(n)}</b>` : '<span style="color:#94A3B8;">0</span>';
    const ov = overlay('projectPortfolio', `
      <div style="padding:14px 16px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;"><b style="font-size:16px;color:#0B5394;flex:1;">📊 Portfolio</b><span style="font-size:12px;color:#64748B;">${rows.length} active project(s)</span><button type="button" id="pfClose" style="border:none;background:none;font-size:20px;cursor:pointer;color:#64748B;">✕</button></div>
      <div style="overflow:auto;padding:0 12px 12px;"><table style="width:100%;border-collapse:collapse;"><thead><tr>
        <th style="${th}">Project</th><th style="${th}">Units</th><th style="${th}">Progress</th><th style="${th}">Completed</th><th style="${th}">Inspections with FAIL</th><th style="${th}">Open issues</th><th style="${th}">Open punch</th><th style="${th}">Last activity</th><th style="${th}">End date</th></tr></thead><tbody>
        ${rows.map(r => { const pct = Number(r.progress || 0); const late = r.end_date && Date.parse(String(r.end_date).slice(0, 10)) < Date.now() && pct < 100; return `<tr data-open="${e(r.id)}" style="cursor:pointer;" title="Open project">
          <td style="${td}"><b>${e(r.name)}</b><div style="color:#94A3B8;">${e(r.client || r.address || '')}</div></td>
          <td style="${td}">${Number(r.units || 0)}</td>
          <td style="${td}min-width:110px;"><b>${pct}%</b><div style="height:5px;background:#E2E8F0;border-radius:3px;margin-top:3px;"><div style="height:5px;width:${Math.min(100, pct)}%;background:${pct >= 100 ? '#059669' : '#2563EB'};border-radius:3px;"></div></div></td>
          <td style="${td}">${Number(r.completed_units || 0)}</td>
          <td style="${td}">${warn(r.failed_inspections, '#DC2626')} / ${Number(r.inspections || 0)}</td>
          <td style="${td}">${warn(r.open_issues, '#D97706')}</td>
          <td style="${td}">${warn(r.open_punch, '#D97706')}</td>
          <td style="${td}">${r.last_activity ? new Date(r.last_activity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
          <td style="${td}${late ? 'color:#DC2626;font-weight:700;' : ''}">${r.end_date ? fmtDate(r.end_date) + (late ? ' ⚠' : '') : '—'}</td></tr>`; }).join('')}
      </tbody></table><p style="font-size:11px;color:#94A3B8;margin-top:8px;">Tap a project to open it. ⚠ = end date passed and not at 100%.</p></div>`, 1100);
    ov.querySelector('#pfClose').onclick = () => ov.remove();
    ov.addEventListener('click', ev => { if (ev.target === ov) ov.remove(); });
    ov.querySelectorAll('[data-open]').forEach(tr => tr.onclick = () => { const pid = tr.dataset.open; ov.remove(); if (pid !== PROJECT_ID) selectHeaderProject(pid); });
  }

  window.openProjectPicker = openProjectPicker;
  window.openProjectDetails = openProjectDetails;
  window.openPortfolio = openPortfolio;
  window.createNewProjectFromSetup = () => createNewProject();
  loadCurrentProjectInfo();
})();
