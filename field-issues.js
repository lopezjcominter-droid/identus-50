// Identus 50 · Field Issues: report problems found in the field (bad work,
// can't be built, damage…) with photos. Shown in its own tab and inside
// Unit List → View → Issues. Data: table public.field_issues; photos in the
// existing storage bucket (same as event photos).
(function () {
  const TYPES = ['Bad workmanship', 'Cannot be built as drawn', 'Conflict with other trade', 'Damaged material', 'Missing information', 'Other'];
  let issues = [];
  let loaded = false;
  let filter = 'open';
  let search = '';
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pid = () => (typeof PROJECT_ID !== 'undefined' ? PROJECT_ID : null);
  const client = () => (typeof sbClient !== 'undefined' ? sbClient : null);
  const note = msg => (typeof toast === 'function' ? toast(msg) : console.log(msg));
  const userName = () => window.userName || window.authSessionUser?.email?.split('@')[0] || '';
  const units = () => {
    let list = [];
    try { list = typeof inspectionEntitySource === 'function' ? inspectionEntitySource() : (Array.isArray(window.data) ? window.data : []); } catch (_) {}
    return list.filter(u => u && u.apt).map(u => ({ id: u.id || null, apt: String(u.apt), building: u.building || '', floor: u.floor || '' }));
  };
  const unitLabel = u => `${u.apt} · ${u.building}${u.floor ? ' · ' + u.floor : ''}`;
  const fmt = d => (d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');

  async function load(force) {
    if (loaded && !force) return;
    const sb = client(); if (!sb || !pid()) return;
    const { data, error } = await sb.from('field_issues').select('*').eq('project_id', pid()).order('created_at', { ascending: false });
    if (error) { note(`❌ Issues: ${/relation|does not exist/i.test(error.message) ? 'run the field_issues SQL in Supabase first' : error.message}`); return; }
    issues = data || []; loaded = true;
  }

  // ---------- form ----------
  function formHtml(prefill) {
    const list = units();
    return `<form id="fiForm" class="fi-form" onsubmit="fiSave(event)">
      <label>Unit / area<div class="fi-unit-pick"><input type="text" id="fiUnitSearch" class="form-input" placeholder="Search unit (e.g. 1204, 3U, Hallway)" autocomplete="off" data-lpignore="true" data-1p-ignore="true" value="${prefill ? esc(unitLabel(prefill)) : ''}" oninput="fiUnitFind(this.value)" onfocus="fiUnitFind(this.value)"><input type="hidden" id="fiUnit" value="${prefill ? list.findIndex(u => u.apt === prefill.apt && u.building === prefill.building) : ''}"><div id="fiUnitResults" class="fi-unit-results"></div></div></label>
      <label>Problem type<select id="fiType" class="form-select" required><option value="">Select type…</option>${TYPES.map(t => `<option>${esc(t)}</option>`).join('')}</select></label>
      <label>Description (optional)<textarea id="fiDesc" class="form-input" rows="2" placeholder="What is wrong?"></textarea></label>
      <div class="fi-photo-btns">
        <label class="btn btn-secondary">📷 Take photo<input id="fiCam" type="file" accept="image/*" capture="environment" multiple hidden onchange="fiPick(this)"></label>
        <label class="btn btn-secondary">📁 Upload<input id="fiFiles" type="file" accept="image/*" multiple hidden onchange="fiPick(this)"></label>
      </div>
      <div id="fiPreview" class="fi-thumbs"></div>
      <button type="submit" class="btn btn-primary" id="fiSaveBtn">Save issue</button>
    </form>`;
  }
  window.fiUnitFind = value => {
    const box = document.getElementById('fiUnitResults'); if (!box) return;
    const term = String(value || '').toLowerCase().trim();
    document.getElementById('fiUnit').value = '';
    const list = units().map((u, i) => ({ u, i })).filter(({ u }) => !term || unitLabel(u).toLowerCase().includes(term)).slice(0, 30);
    box.innerHTML = list.map(({ u, i }) => `<button type="button" onmousedown="fiUnitChoose(${i})">${esc(unitLabel(u))}</button>`).join('') || '<div class="fi-empty">No match</div>';
    box.style.display = 'block';
  };
  window.fiUnitChoose = i => {
    const u = units()[i]; if (!u) return;
    document.getElementById('fiUnit').value = String(i);
    document.getElementById('fiUnitSearch').value = unitLabel(u);
    document.getElementById('fiUnitResults').style.display = 'none';
  };
  document.addEventListener('click', e => { if (!e.target.closest('.fi-unit-pick')) { const b = document.getElementById('fiUnitResults'); if (b) b.style.display = 'none'; } });
  let picked = [];
  window.fiPick = input => {
    picked = picked.concat(Array.from(input.files || []));
    input.value = '';
    const box = document.getElementById('fiPreview');
    if (box) box.innerHTML = picked.map((f, i) => `<span class="fi-thumb"><img src="${URL.createObjectURL(f)}" alt=""><button type="button" onclick="fiUnpick(${i})">×</button></span>`).join('');
  };
  window.fiUnpick = i => { picked.splice(i, 1); window.fiPick({ files: [], value: '' }); };

  window.fiSave = async event => {
    event.preventDefault();
    const list = units(); const raw = document.getElementById('fiUnit')?.value; const u = raw === '' ? null : list[Number(raw)];
    const type = document.getElementById('fiType')?.value;
    if (!u || !type) { note('Choose the unit from the list and the problem type'); return; }
    if (!picked.length) { note('Add at least one photo'); return; }
    const btn = document.getElementById('fiSaveBtn'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      const urls = await readAndCompressPhotos(picked, 0.7, userName());
      const row = { project_id: pid(), unit_id: u.id && /^[0-9a-f-]{36}$/i.test(u.id) ? u.id : null, apt: u.apt, building: u.building, floor: u.floor, issue_type: type, description: document.getElementById('fiDesc')?.value.trim() || null, photos: urls, created_by_name: userName() };
      const { data, error } = await client().from('field_issues').insert(row).select().single();
      if (error) throw error;
      issues.unshift(data); picked = [];
      note('Issue saved');
      rerender();
    } catch (error) { note(`❌ Could not save: ${error.message || 'connection error'}`); }
    finally { if (btn) { btn.disabled = false; btn.textContent = 'Save issue'; } }
  };

  // ---------- actions ----------
  window.fiResolve = async id => {
    const i = issues.find(x => x.id === id); if (!i) return;
    const reopen = i.status === 'resolved';
    const patch = reopen ? { status: 'open', resolved_at: null, resolved_by_name: null } : { status: 'resolved', resolved_at: new Date().toISOString(), resolved_by_name: userName() };
    const { error } = await client().from('field_issues').update(patch).eq('id', id);
    if (error) { note(`❌ ${error.message}`); return; }
    Object.assign(i, patch); rerender();
  };
  window.fiDelete = async id => {
    if (!confirm('Delete this issue and its record? This cannot be undone.')) return;
    const { error } = await client().from('field_issues').delete().eq('id', id);
    if (error) { note(`❌ ${error.message}`); return; }
    issues = issues.filter(x => x.id !== id); rerender();
  };
  // Download all photos of one issue.
  window.fiDownload = async id => {
    const i = issues.find(x => x.id === id); if (!i) return;
    for (const [n, url] of (i.photos || []).entries()) {
      try {
        const blob = await (await fetch(url)).blob();
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `${i.apt}_${String(i.issue_type).replace(/\W+/g, '-')}_${n + 1}.jpg`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      } catch (_) { window.open(url, '_blank'); }
    }
  };
  // Export the list (current filter) to CSV with photo links (opens in Excel).
  window.fiExport = () => {
    const rows = visible();
    const head = ['Unit', 'Building', 'Floor', 'Type', 'Description', 'Status', 'Reported by', 'Date', 'Photos'];
    const csv = [head, ...rows.map(i => [i.apt, i.building, i.floor, i.issue_type, i.description || '', i.status, i.created_by_name || '', i.created_at, (i.photos || []).join(' ')])]
      .map(r => r.map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = `field-issues-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };

  // ---------- lists ----------
  const visible = unit => issues.filter(i => (!unit || (i.apt === unit.apt && (!unit.building || i.building === unit.building)))
    && (filter === 'all' || i.status === filter)
    && (!search || `${i.apt} ${i.building} ${i.issue_type} ${i.description || ''}`.toLowerCase().includes(search)));
  // Compact row: unit, type, the comment highlighted, a 📷 icon (tap to see
  // the photos) and small actions. Keeps long lists short.
  const card = i => `<div class="fi-row ${i.status === 'resolved' ? 'fi-resolved' : ''}">
      <div class="fi-row-main">
        <div class="fi-row-top"><strong>${esc(i.apt)}</strong><span class="fi-muted">${esc(i.building)}</span><span class="fi-chip">${esc(i.issue_type)}</span><span class="fi-status">${i.status === 'resolved' ? '✓ Resolved' : 'Open'}</span></div>
        <div class="fi-comment">${i.description ? esc(i.description) : '<span class="fi-muted">No comment</span>'}</div>
        <div class="fi-muted fi-small">${esc(i.created_by_name || '')} · ${fmt(i.created_at)}</div>
        <div class="fi-thumbs" id="fiPh-${i.id}" hidden>${(i.photos || []).map(u => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Issue photo" loading="lazy"></a>`).join('')}</div>
      </div>
      <div class="fi-row-actions">
        ${(i.photos || []).length ? `<button type="button" class="fi-icon" title="Show photos" onclick="fiTogglePhotos('${i.id}')">📷 ${i.photos.length}</button>` : ''}
        <button type="button" class="fi-icon" title="${i.status === 'resolved' ? 'Reopen' : 'Resolve'}" onclick="fiResolve('${i.id}')">${i.status === 'resolved' ? '↺' : '✓'}</button>
        <button type="button" class="fi-icon" title="Download photos" onclick="fiDownload('${i.id}')">⬇</button>
        <button type="button" class="fi-icon fi-del" title="Delete" onclick="fiDelete('${i.id}')">🗑</button>
      </div>
    </div>`;
  window.fiTogglePhotos = id => { const el = document.getElementById(`fiPh-${id}`); if (el) el.hidden = !el.hidden; };
  const toolbar = () => `<div class="fi-toolbar">
      ${['open', 'resolved', 'all'].map(f => `<button type="button" class="btn ${filter === f ? 'btn-primary' : 'btn-secondary'}" onclick="fiFilter('${f}')">${f === 'open' ? 'Open' : f === 'resolved' ? 'Resolved' : 'All'} (${issues.filter(i => f === 'all' || i.status === f).length})</button>`).join('')}
      <input type="text" class="form-input fi-search" id="fiSearch" placeholder="Search unit or type" autocomplete="off" data-lpignore="true" data-1p-ignore="true" value="${esc(search)}" oninput="fiSearchInput(this.value)">
      <button type="button" class="btn btn-secondary" onclick="fiExport()">⬇ Export Excel</button>
    </div>`;
  window.fiFilter = f => { filter = f; rerender(); };
  window.fiSearchInput = v => { search = String(v || '').toLowerCase().trim(); const host = document.getElementById('fiList'); if (host) host.innerHTML = visible(currentUnit).map(card).join('') || '<div class="fi-empty">No issues.</div>'; };

  let currentUnit = null;
  function rerender() {
    if (document.getElementById('fiUnitHost')) return window.fiRenderUnit(currentUnit, true);
    if (document.getElementById('issuesTabContent')) return window.fiRenderTab(true);
  }
  window.fiRenderTab = async (skipLoad) => {
    const host = document.getElementById('issuesTabContent'); if (!host) return;
    currentUnit = null;
    if (!skipLoad) { host.innerHTML = '<div class="fi-empty">Loading…</div>'; await load(true); }
    host.innerHTML = `<div class="fi-wrap" data-no-translate><h3>📷 Field Issues</h3><p class="fi-sub">Report work that is wrong or cannot be built, with photos.</p>${formHtml(null)}${toolbar()}<div id="fiList">${visible().map(card).join('') || '<div class="fi-empty">No issues.</div>'}</div></div>`;
  };
  window.fiRenderUnit = async (unit, skipLoad) => {
    const host = document.getElementById('fiUnitHost'); if (!host || !unit) return;
    currentUnit = { apt: unit.apt, building: unit.building };
    if (!skipLoad) { host.innerHTML = '<div class="fi-empty">Loading…</div>'; await load(true); }
    host.innerHTML = `<div class="fi-wrap" data-no-translate>${formHtml(unit)}${toolbar()}<div id="fiList">${visible(currentUnit).map(card).join('') || '<div class="fi-empty">No issues for this unit.</div>'}</div></div>`;
  };

  const css = document.createElement('style');
  css.textContent = `.fi-wrap{display:flex;flex-direction:column;gap:12px}.fi-wrap h3{margin:0}.fi-sub{margin:0;color:#64748B;font-size:13px}
  .fi-form{display:grid;gap:10px;padding:12px;border:1px solid #E2E8F0;border-radius:8px;background:#F8FAFC}.fi-form label{display:grid;gap:4px;font-size:13px;font-weight:600;color:#334155}
  .fi-photo-btns{display:flex;gap:8px;flex-wrap:wrap}.fi-photo-btns .btn{cursor:pointer}
  .fi-thumbs{display:flex;flex-wrap:wrap;gap:6px}.fi-thumbs img{width:72px;height:72px;object-fit:cover;border-radius:6px;border:1px solid #E2E8F0}
  .fi-thumb{position:relative}.fi-thumb button{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:0;background:#DC2626;color:#fff;font-size:12px;line-height:20px;padding:0}
  .fi-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.fi-search{flex:1;min-width:160px;max-width:300px}
  .fi-card{border:1px solid #E2E8F0;border-left:4px solid #DC2626;border-radius:8px;padding:10px 12px;background:#fff;display:grid;gap:6px;margin-bottom:8px}
  .fi-card.fi-resolved{border-left-color:#16A34A;opacity:.85}.fi-card-head{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13px}
  .fi-chip{background:#FEF3C7;color:#92400E;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600}.fi-status{margin-left:auto;font-size:11px;font-weight:700;color:#64748B}
  .fi-desc{font-size:13px;color:#334155}.fi-meta{font-size:11px;color:#64748B}.fi-actions{display:flex;gap:6px;flex-wrap:wrap}.fi-actions .btn{font-size:12px;padding:4px 10px}
  .fi-empty{color:#64748B;padding:10px 0}
  .fi-row{display:flex;gap:10px;align-items:flex-start;border:1px solid #E2E8F0;border-left:4px solid #DC2626;border-radius:8px;padding:8px 10px;background:#fff;margin-bottom:6px}
  .fi-row.fi-resolved{border-left-color:#16A34A;opacity:.8}.fi-row-main{flex:1;min-width:0;display:grid;gap:3px}
  .fi-row-top{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13px}.fi-comment{font-size:14px;font-weight:600;color:#0F172A;overflow-wrap:anywhere}
  .fi-muted{color:#64748B}.fi-small{font-size:11px}.fi-row-actions{display:flex;gap:4px;flex-shrink:0}
  .fi-icon{border:1px solid #E2E8F0;background:#F8FAFC;border-radius:6px;padding:4px 8px;font-size:13px;cursor:pointer;white-space:nowrap}.fi-icon:hover{background:#EFF6FF}.fi-del:hover{background:#FEE2E2}
  .fi-unit-pick{position:relative}.fi-unit-results{display:none;position:absolute;left:0;right:0;top:100%;z-index:50;max-height:240px;overflow:auto;background:#fff;border:1px solid #CBD5E1;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.12)}
  .fi-unit-results button{display:block;width:100%;text-align:left;padding:8px 10px;border:0;background:#fff;font-size:13px;cursor:pointer}.fi-unit-results button:hover{background:#EFF6FF}
  .fi-wrap{max-width:900px}`;
  document.head.appendChild(css);
})();
