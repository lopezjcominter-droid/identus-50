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

  // ---------- offline queue: new issues saved without signal ----------
  const qdb = () => new Promise((res, rej) => { const r = indexedDB.open('identus_fi', 1); r.onupgradeneeded = () => r.result.createObjectStore('q', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const qAll = async () => { try { const db = await qdb(); return await new Promise(res => { const q = db.transaction('q').objectStore('q').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); } catch (_) { return []; } };
  const qOp = async (fn) => { try { const db = await qdb(); await new Promise(res => { const tx = db.transaction('q', 'readwrite'); fn(tx.objectStore('q')); tx.oncomplete = res; tx.onerror = res; }); } catch (_) {} };
  const isPending = id => String(id).startsWith('pending-');
  let flushing = false;
  async function flushQueue() {
    if (flushing || !navigator.onLine || !client() || !pid()) return;
    const queued = await qAll(); if (!queued.length) return;
    flushing = true; let done = 0;
    try {
      for (const item of queued) {
        try {
          const stamp = Date.now();
          const urls = [];
          for (const [n, ph] of item.photos.entries()) urls.push(String(ph).startsWith('data:') ? await uploadToStorage(ph, `photos/${pid()}/${stamp}_${n}_${Math.random().toString(36).slice(2, 7)}.jpg`, 'image/jpeg') : ph);
          const { data, error } = await client().from('field_issues').insert({ ...item.fields, photos: urls, project_id: item.project_id, created_by_name: item.created_by_name, created_at: item.created_at }).select().single();
          if (error) throw error;
          await qOp(st => st.delete(item.id));
          issues = issues.filter(x => x.id !== item.id); issues.unshift(data); done++;
        } catch (e) { console.warn('fi flush', e); break; }
      }
    } finally { flushing = false; }
    if (done) { note(`✅ ${done} offline issue(s) synced`); rerender(); }
  }
  window.addEventListener('online', () => setTimeout(flushQueue, 1500));
  setInterval(() => { if (navigator.onLine) flushQueue(); }, 60000);

  async function load(force) {
    if (loaded && !force) return;
    const sb = client(); if (!sb || !pid()) return;
    const { data, error } = await sb.from('field_issues').select('*').eq('project_id', pid()).order('created_at', { ascending: false });
    if (error) { note(`❌ Issues: ${/relation|does not exist/i.test(error.message) ? 'run the field_issues SQL in Supabase first' : error.message}`); return; }
    const queued = (await qAll()).filter(q => q.project_id === pid()).map(q => ({ ...q.fields, id: q.id, photos: q.photos, status: 'open', created_by_name: q.created_by_name, created_at: q.created_at, _pending: true }));
    issues = [...queued, ...(data || [])]; loaded = true;
    if (queued.length) setTimeout(flushQueue, 500);
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
  // Editing: the issue being edited and the photos it keeps.
  let editing = null; let keptPhotos = [];
  const preview = () => {
    const box = document.getElementById('fiPreview'); if (!box) return;
    box.innerHTML = keptPhotos.map((u, i) => `<span class="fi-thumb"><img src="${esc(u)}" alt=""><button type="button" title="Remove photo" onclick="fiUnkeep(${i})">×</button></span>`).join('')
      + picked.map((f, i) => `<span class="fi-thumb"><img src="${URL.createObjectURL(f)}" alt=""><button type="button" onclick="fiUnpick(${i})">×</button></span>`).join('');
  };
  window.fiUnkeep = i => { keptPhotos.splice(i, 1); preview(); };
  window.fiPick = input => {
    picked = picked.concat(Array.from(input.files || []));
    input.value = '';
    preview();
  };
  window.fiUnpick = i => { picked.splice(i, 1); window.fiPick({ files: [], value: '' }); };

  window.fiSave = async event => {
    event.preventDefault();
    const list = units(); const raw = document.getElementById('fiUnit')?.value; const u = raw === '' ? null : list[Number(raw)];
    const type = document.getElementById('fiType')?.value;
    if (!u || !type) { note('Choose the unit from the list and the problem type'); return; }
    if (!picked.length && !keptPhotos.length) { note('Add at least one photo'); return; }
    const btn = document.getElementById('fiSaveBtn'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      let uploaded = null;
      if (navigator.onLine && picked.length) {
        window.__photoUploadDeferred = false;
        uploaded = await readAndCompressPhotos(picked, 0.7, userName());
      }
      const signalDropped = uploaded && uploaded.some(u => String(u).startsWith('data:'));
      if ((!navigator.onLine || signalDropped) && !editing) {
        // No signal: keep the issue and its photos on this device until it reconnects.
        const photos = uploaded || await Promise.all(picked.map(f => compressImage(f, 0.7)));
        const fields = { unit_id: u.id && /^[0-9a-f-]{36}$/i.test(u.id) ? u.id : null, apt: u.apt, building: u.building, floor: u.floor, issue_type: type, description: document.getElementById('fiDesc')?.value.trim() || null };
        const item = { id: 'pending-' + Date.now(), project_id: pid(), fields, photos, created_by_name: userName(), created_at: new Date().toISOString() };
        await qOp(st => st.put(item));
        issues.unshift({ ...fields, id: item.id, photos, status: 'open', created_by_name: item.created_by_name, created_at: item.created_at, _pending: true });
        note('📴 Saved on this device — it will upload when the signal returns');
        picked = []; keptPhotos = []; rerender(); return;
      }
      if (editing && isPending(editing)) { note('This issue is waiting for signal to upload. Edit it after it syncs.'); return; }
      if (signalDropped) throw new Error('the signal dropped while uploading photos; try again');
      const urls = uploaded || (picked.length ? await readAndCompressPhotos(picked, 0.7, userName()) : []);
      const fields = { unit_id: u.id && /^[0-9a-f-]{36}$/i.test(u.id) ? u.id : null, apt: u.apt, building: u.building, floor: u.floor, issue_type: type, description: document.getElementById('fiDesc')?.value.trim() || null, photos: [...keptPhotos, ...urls] };
      if (editing) {
        const { data, error } = await client().from('field_issues').update(fields).eq('id', editing).select().single();
        if (error) throw error;
        issues = issues.map(x => x.id === editing ? data : x);
        note('Issue updated');
      } else {
        const { data, error } = await client().from('field_issues').insert({ ...fields, project_id: pid(), created_by_name: userName() }).select().single();
        if (error) throw error;
        issues.unshift(data);
        note('Issue saved');
      }
      picked = []; keptPhotos = []; editing = null;
      rerender();
    } catch (error) { note(`❌ Could not save: ${error.message || 'connection error'}`); }
    finally { if (btn) { btn.disabled = false; btn.textContent = 'Save issue'; } }
  };

  // ---------- actions ----------
  // Closing an issue asks for proof: a note and at least one photo (like a failed inspection).
  let resolving = null; let proof = [];
  window.fiResolve = async id => {
    const i = issues.find(x => x.id === id); if (!i) return;
    if (isPending(id)) { note('Waiting for signal to upload this issue'); return; }
    if (!canManageReport()) { note('Only admins or PMs can close or reopen issues'); return; }
    if (i.status === 'resolved') {
      if (!confirm('Reopen this issue?')) return;
      const history = [...(i.resolution_history || []), { resolved_at: i.resolved_at, resolved_by_name: i.resolved_by_name, note: i.resolution_note || '', photos: i.resolution_photos || [], reopened_at: new Date().toISOString(), reopened_by_name: userName() }];
      const patch = { status: 'open', resolved_at: null, resolved_by_name: null, resolution_note: null, resolution_photos: [], resolution_history: history };
      const { error } = await client().from('field_issues').update(patch).eq('id', id);
      if (error) { note(`❌ ${error.message}`); return; }
      Object.assign(i, patch); rerender(); return;
    }
    resolving = id; proof = [];
    document.getElementById('fiResolveModal')?.remove();
    const m = document.createElement('div'); m.id = 'fiResolveModal'; m.className = 'fi-modal';
    m.innerHTML = `<div class="fi-modal-box">
        <h3>Close issue · Unit ${esc(i.apt)}</h3>
        <div class="fi-muted fi-small">${esc(i.issue_type)}${i.description ? ' — ' + esc(i.description) : ''}</div>
        <label>What was done to resolve it? *<textarea id="fiResNote" class="form-input" rows="3" placeholder="Describe the correction"></textarea></label>
        <div class="fi-photo-btns">
          <label class="btn btn-secondary">📷 Take photo<input type="file" accept="image/*" capture="environment" multiple hidden onchange="fiProofPick(this)"></label>
          <label class="btn btn-secondary">📁 Upload<input type="file" accept="image/*" multiple hidden onchange="fiProofPick(this)"></label>
        </div>
        <div id="fiProofPreview" class="fi-thumbs"></div>
        <div class="fi-modal-actions"><button type="button" class="btn btn-secondary" onclick="fiResolveCancel()">Cancel</button><button type="button" class="btn btn-primary" id="fiResSave" onclick="fiResolveSave()">✓ Close issue</button></div>
      </div>`;
    document.body.appendChild(m);
  };
  const proofPreview = () => { const box = document.getElementById('fiProofPreview'); if (box) box.innerHTML = proof.map((f, k) => `<span class="fi-thumb"><img src="${URL.createObjectURL(f)}" alt=""><button type="button" onclick="fiProofUnpick(${k})">×</button></span>`).join(''); };
  window.fiProofPick = input => { proof = proof.concat(Array.from(input.files || [])); input.value = ''; proofPreview(); };
  window.fiProofUnpick = k => { proof.splice(k, 1); proofPreview(); };
  window.fiResolveCancel = () => { resolving = null; proof = []; document.getElementById('fiResolveModal')?.remove(); };
  window.fiResolveSave = async () => {
    const i = issues.find(x => x.id === resolving); if (!i) return window.fiResolveCancel();
    const text = document.getElementById('fiResNote')?.value.trim();
    if (!text) { note('Write a note explaining how it was resolved'); return; }
    if (!proof.length) { note('Add at least one photo as proof'); return; }
    if (!navigator.onLine) { note('No signal: connect to close this issue'); return; }
    const btn = document.getElementById('fiResSave'); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      window.__photoUploadDeferred = false;
      const urls = await readAndCompressPhotos(proof, 0.7, userName());
      if (urls.some(u => String(u).startsWith('data:'))) throw new Error('the signal dropped while uploading photos; try again');
      const patch = { status: 'resolved', resolved_at: new Date().toISOString(), resolved_by_name: userName(), resolution_note: text, resolution_photos: urls };
      const { error } = await client().from('field_issues').update(patch).eq('id', i.id);
      if (error) throw new Error(/resolution_/.test(error.message) ? 'run the field issue resolution SQL in Supabase first' : error.message);
      Object.assign(i, patch); window.fiResolveCancel(); note('✅ Issue closed with proof'); rerender();
    } catch (e) { note(`❌ Could not close: ${e.message || 'connection error'}`); if (btn) { btn.disabled = false; btn.textContent = '✓ Close issue'; } }
  };
  window.fiDelete = async id => {
    if (!confirm('Delete this issue and its record? This cannot be undone.')) return;
    if (isPending(id)) { await qOp(st => st.delete(id)); issues = issues.filter(x => x.id !== id); rerender(); return; }
    const { error } = await client().from('field_issues').delete().eq('id', id);
    if (error) { note(`❌ ${error.message}`); return; }
    issues = issues.filter(x => x.id !== id); rerender();
  };
  // Download all photos of one issue.
  window.fiDownload = async id => {
    const i = issues.find(x => x.id === id); if (!i) return;
    const all = [...(i.photos || []).map(u => [u, '']), ...(i.resolution_photos || []).map(u => [u, '_proof'])];
    for (const [n, [url, tag]] of all.entries()) {
      try {
        const blob = await (await fetch(url)).blob();
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `${i.apt}_${String(i.issue_type).replace(/\W+/g, '-')}${tag}_${n + 1}.jpg`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      } catch (_) { window.open(url, '_blank'); }
    }
  };
  // Export the list (current filter) to CSV with photo links (opens in Excel).
  window.fiExport = () => {
    const rows = visible();
    const head = ['Unit', 'Building', 'Floor', 'Type', 'Description', 'Status', 'Reported by', 'Date', 'Photos', 'Resolved by', 'Resolved at', 'Resolution note', 'Proof photos'];
    const csv = [head, ...rows.map(i => [i.apt, i.building, i.floor, i.issue_type, i.description || '', i.status, i.created_by_name || '', i.created_at, (i.photos || []).join(' '), i.resolved_by_name || '', i.resolved_at || '', i.resolution_note || '', (i.resolution_photos || []).join(' ')])]
      .map(r => r.map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = `field-issues-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(a); a.click(); a.remove();
  };

  // Professional PDF report (print to PDF): header, summary and one block per
  // issue with its photos — same style as the Punch List report.
  window.fiExportPdf = async (btn) => {
    // Project view: the full weekly-style report (logo, summary, open issues with photos, resolved with proof).
    if (!currentUnit && client()) {
      const b = btn || document.activeElement; const old = b?.textContent; if (b) { b.disabled = true; b.textContent = 'Preparing…'; }
      try {
        const { data: { session } } = await client().auth.getSession();
        const r = await fetch('/.netlify/functions/fi-report', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session?.access_token || '') }, body: JSON.stringify({ action: 'pdf', projectId: pid() }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
        showPdf(Uint8Array.from(atob(j.pdf), c => c.charCodeAt(0)), j.filename, true);
        return;
      } catch (e) { note(`❌ ${e.message}`); return; }
      finally { if (b) { b.disabled = false; b.textContent = old; } }
    }
    const rows = visible(currentUnit);
    if (!rows.length) { note('No issues to export'); return; }
    const project = (document.querySelector('.project-name, #projectNameLabel')?.textContent || document.title || 'Identus 50').trim();
    const open = rows.filter(i => i.status !== 'resolved').length;
    const byType = TYPES.map(t => [t, rows.filter(i => i.issue_type === t).length]).filter(([, n]) => n);
    const block = (i, n) => `<section class="iss">
        <div class="iss-head"><span class="num">${n}</span><strong>Unit ${esc(i.apt)}</strong><span>${esc(i.building)}${i.floor ? ' · ' + esc(i.floor) : ''}</span><span class="type">${esc(i.issue_type)}</span><span class="st ${i.status === 'resolved' ? 'ok' : 'open'}">${i.status === 'resolved' ? 'RESOLVED' : 'OPEN'}</span></div>
        <div class="desc">${i.description ? esc(i.description) : '<em>No comment</em>'}</div>
        <div class="meta">Reported by ${esc(i.created_by_name || '-')} · ${fmt(i.created_at)}${i.resolved_at ? ` · Resolved ${fmt(i.resolved_at)}${i.resolved_by_name ? ' by ' + esc(i.resolved_by_name) : ''}` : ''}</div>
        ${(i.photos || []).length ? `<div class="ph">${i.photos.map(u => `<img src="${esc(u)}" alt="">`).join('')}</div>` : ''}
        ${i.status === 'resolved' && (i.resolution_note || (i.resolution_photos || []).length) ? `<div class="res"><b>Resolution:</b> ${esc(i.resolution_note || '')}${(i.resolution_photos || []).length ? `<div class="ph">${i.resolution_photos.map(u => `<img src="${esc(u)}" alt="">`).join('')}</div>` : ''}</div>` : ''}
      </section>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Field Issues Report</title><style>
      @page{size:letter;margin:14mm}body{font-family:Inter,Arial,sans-serif;color:#0F172A;font-size:12px;margin:0}
      header{border-bottom:3px solid #0B5394;padding-bottom:8px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-end}
      h1{font-size:20px;margin:0;color:#0B5394}.sub{color:#475569}.sum{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 14px}
      .box{border:1px solid #CBD5E1;border-radius:6px;padding:6px 10px}.box b{font-size:16px;display:block}
      .iss{border:1px solid #E2E8F0;border-left:4px solid #DC2626;border-radius:6px;padding:8px 10px;margin-bottom:10px;page-break-inside:avoid}
      .iss-head{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.num{background:#0B5394;color:#fff;border-radius:4px;padding:1px 6px;font-weight:700}
      .type{background:#FEF3C7;color:#92400E;border-radius:999px;padding:1px 8px;font-size:11px}.st{margin-left:auto;font-weight:700;font-size:11px}.st.open{color:#DC2626}.st.ok{color:#16A34A}
      .desc{font-size:13px;font-weight:600;margin:6px 0 3px}.meta{color:#64748B;font-size:10px}
      .ph{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px}.ph img{width:100%;height:150px;object-fit:cover;border-radius:4px;border:1px solid #E2E8F0}
      .res{margin-top:8px;padding:6px 8px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px}
      footer{margin-top:16px;color:#94A3B8;font-size:10px;text-align:center}
    </style></head><body>
      <header><div><h1>Field Issues Report</h1><div class="sub">${esc(project)}${currentUnit ? ` · Unit ${esc(currentUnit.apt)}` : ''}</div></div><div class="sub">${new Date().toLocaleString('en-US')}</div></header>
      <div class="sum"><div class="box"><b>${rows.length}</b>Issues</div><div class="box"><b style="color:#DC2626">${open}</b>Open</div><div class="box"><b style="color:#16A34A">${rows.length - open}</b>Resolved</div>${byType.map(([t, n]) => `<div class="box"><b>${n}</b>${esc(t)}</div>`).join('')}</div>
      ${rows.map((i, k) => block(i, k + 1)).join('')}
      <footer>Generated by Identus 50 QA/QC</footer>
      <script>window.onload=()=>{const imgs=[...document.images];let left=imgs.length;const go=()=>setTimeout(()=>window.print(),300);if(!left)return go();imgs.forEach(im=>{if(im.complete){if(!--left)go();}else{im.onload=im.onerror=()=>{if(!--left)go();};}});};<\/script>
    </body></html>`;
    const w = window.open('', '_blank');
    if (!w) { note('Allow pop-ups to export the PDF'); return; }
    w.document.write(html); w.document.close();
  };

  // ---------- lists ----------
  const visible = unit => issues.filter(i => (!unit || (i.apt === unit.apt && (!unit.building || i.building === unit.building)))
    && (filter === 'all' || i.status === filter)
    && (!search || `${i.apt} ${i.building} ${i.issue_type} ${i.description || ''}`.toLowerCase().includes(search)));
  // Compact row: unit, type, the comment highlighted, a 📷 icon (tap to see
  // the photos) and small actions. Keeps long lists short.
  // Open issues older than 7 days are flagged in red.
  const daysOpen = i => Math.floor((Date.now() - Date.parse(i.created_at || 0)) / 86400000);
  const isOld = i => i.status !== 'resolved' && !i._pending && daysOpen(i) > 7;
  function updateIssuesBadge() {
    const btn = [...document.querySelectorAll('button.tab-main')].find(b => /switchMainTab\('issues'/.test(b.getAttribute('onclick') || ''));
    if (!btn) return;
    const old = issues.filter(isOld).length;
    let badge = btn.querySelector('.fi-old-badge');
    if (!old) { if (badge) badge.remove(); return; }
    if (!badge) { badge = document.createElement('span'); badge.className = 'fi-old-badge'; badge.style.cssText = 'margin-left:6px;background:#DC2626;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;'; btn.appendChild(badge); }
    badge.textContent = old; badge.title = `${old} open issue(s) older than 7 days`;
  }
  window.fiUpdateBadge = updateIssuesBadge;
  // Load once in the background so the tab shows the count without opening it.
  const backgroundLoad = tries => { if (window.userRole && !window.authNoProjectAccess) load().then(updateIssuesBadge).catch(() => {}); else if (tries > 0) setTimeout(() => backgroundLoad(tries - 1), 10000); };
  setTimeout(() => backgroundLoad(6), 8000);
  const card = i => `<div class="fi-row ${i.status === 'resolved' ? 'fi-resolved' : ''}"${isOld(i) ? ' style="border-left:4px solid #DC2626;"' : ''}>
      <div class="fi-row-main">
        <div class="fi-row-top"><strong>${esc(i.apt)}</strong><span class="fi-muted">${esc(i.building)}</span><span class="fi-chip">${esc(i.issue_type)}</span>${isOld(i) ? `<span class="fi-chip" style="background:#FEE2E2;color:#991B1B;">⚠ ${daysOpen(i)} days open</span>` : ''}<span class="fi-status">${i._pending ? '📴 Pending upload' : i.status === 'resolved' ? '✓ Resolved' : 'Open'}</span></div>
        <div class="fi-comment">${i.description ? esc(i.description) : '<span class="fi-muted">No comment</span>'}</div>
        <div class="fi-muted fi-small">${esc(i.created_by_name || '')} · ${fmt(i.created_at)}</div>
        ${(i.resolution_history || []).length ? `<div class="fi-muted fi-small">↺ Reopened ${i.resolution_history.length}×: ${i.resolution_history.map(h => `closed ${fmt(h.resolved_at)} by ${esc(h.resolved_by_name || '-')} (“${esc(h.note || '')}”), reopened ${fmt(h.reopened_at)} by ${esc(h.reopened_by_name || '-')}`).join(' · ')}</div>` : ''}
        ${i.status === 'resolved' && (i.resolution_note || (i.resolution_photos || []).length) ? `<div class="fi-resolution">✓ ${esc(i.resolution_note || '')} <span class="fi-muted fi-small">— ${esc(i.resolved_by_name || '')} · ${fmt(i.resolved_at)}</span></div>` : ''}
        <div class="fi-thumbs" id="fiPh-${i.id}" hidden>${[...(i.photos || []), ...(i.resolution_photos || [])].map((u, k, arr) => `<a href="${esc(u)}" onclick="event.preventDefault();fiLightbox(${esc(JSON.stringify(arr))},${k})"><img src="${esc(typeof storageThumbnailUrl === 'function' ? storageThumbnailUrl(u) : u)}" data-full="${esc(u)}" onerror="this.onerror=null;this.src=this.dataset.full" alt="Issue photo" loading="lazy"></a>`).join('')}</div>
      </div>
      <div class="fi-row-actions">
        ${(i.photos || []).length + (i.resolution_photos || []).length ? `<button type="button" class="fi-icon" title="Show photos" onclick="fiTogglePhotos('${i.id}')">📷 ${(i.photos || []).length + (i.resolution_photos || []).length}</button>` : ''}
        ${canManageReport() ? `<button type="button" class="fi-icon fi-state" title="${i.status === 'resolved' ? 'Resolved · click to reopen' : 'Pending · click to resolve with proof'}" aria-label="${i.status === 'resolved' ? 'Reopen' : 'Resolve'}" onclick="fiResolve('${i.id}')">${i.status === 'resolved' ? '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="display:block"><circle cx="12" cy="12" r="10" fill="#16A34A"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="display:block"><circle cx="12" cy="12" r="10" fill="#F59E0B"/><path d="M12 7v5.5l3.2 2" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</button>` : ''}
        <button type="button" class="fi-icon fi-dl" title="Download photos" aria-label="Download photos" onclick="fiDownload('${i.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 19h14"/></svg></button>
        <button type="button" class="fi-icon" title="Edit" onclick="fiEdit('${i.id}')">✏️</button>
        <button type="button" class="fi-icon fi-del" title="Delete" onclick="fiDelete('${i.id}')">🗑</button>
      </div>
    </div>`;
  window.fiEdit = id => {
    const i = issues.find(x => x.id === id); if (!i) return;
    editing = id; keptPhotos = [...(i.photos || [])]; picked = [];
    const list = units(); const idx = list.findIndex(u => u.apt === i.apt && u.building === i.building);
    const f = document.getElementById('fiForm'); if (!f) return;
    document.getElementById('fiUnit').value = idx >= 0 ? String(idx) : '';
    document.getElementById('fiUnitSearch').value = idx >= 0 ? unitLabel(list[idx]) : i.apt;
    document.getElementById('fiType').value = i.issue_type;
    document.getElementById('fiDesc').value = i.description || '';
    document.getElementById('fiSaveBtn').textContent = 'Save changes';
    let cancel = document.getElementById('fiCancelEdit');
    if (!cancel) { cancel = document.createElement('button'); cancel.type = 'button'; cancel.id = 'fiCancelEdit'; cancel.className = 'btn btn-secondary'; cancel.textContent = 'Cancel edit'; cancel.onclick = () => { editing = null; keptPhotos = []; picked = []; rerender(); }; f.appendChild(cancel); }
    preview();
    f.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  window.fiTogglePhotos = id => { const el = document.getElementById(`fiPh-${id}`); if (el) el.hidden = !el.hidden; };
  const toolbar = () => `<div class="fi-toolbar">
      ${['open', 'resolved', 'all'].map(f => `<button type="button" class="btn ${filter === f ? 'btn-primary' : 'btn-secondary'}" onclick="fiFilter('${f}')">${f === 'open' ? 'Open' : f === 'resolved' ? 'Resolved' : 'All'} (${issues.filter(i => f === 'all' || i.status === f).length})</button>`).join('')}
      <input type="search" class="form-input fi-search" id="fiSearch" name="fi-filter-${Date.now()}" placeholder="Search unit or type" autocomplete="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="none" data-form-type="other" data-lpignore="true" data-1p-ignore="true" readonly onpointerdown="this.removeAttribute('readonly')" onkeydown="this.removeAttribute('readonly')" value="${esc(search)}" oninput="fiSearchInput(this.value)">
      <button type="button" class="btn btn-secondary" onclick="fiExportPdf(this)">📄 Export PDF</button><button type="button" class="btn btn-secondary" onclick="fiExport()" title="Spreadsheet with photo links">⬇ Excel</button>${canManageReport() ? '<button type="button" class="btn btn-secondary" onclick="fiReportSettings()" title="Weekly e-mail report (admins/PMs)">✉ Weekly e-mail</button>' : ''}
    </div>`;

  // ---------- weekly e-mail report (settings; admins/PMs only) ----------
  const canManageReport = () => window.userRole === 'admin' || window.userRole === 'pm';
  const DEFAULT_SUBJECT = '{project} – Weekly Field Issues Report | Week Ending {date}';
  const DEFAULT_BODY = `Good afternoon,

Please find attached the weekly Field Issues report for {project}, covering the week ending {date}.

• Resolved this week: {resolved_week}
• Open: {open_count}
• Open for more than 7 days: {old_count}

The report includes the details and photos of each item. We appreciate your support in coordinating the closure of the open items.

Best regards,

Aireko QA/QC Automated System

This is an automated message. Please do not reply to this e-mail. For questions, contact {contact_email}.`;
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const reportDefaults = () => ({ enabled: false, weekday: 5, send_time: '18:00', timezone: 'America/New_York', recipients: '', subject: DEFAULT_SUBJECT, body: DEFAULT_BODY, sender_name: 'Aireko QA/QC Automated System', sender_title: '', company: 'Aireko', sender_phone: '' });
  window.fiReportSettings = async () => {
    if (!canManageReport()) { note('Admins or PMs only'); return; }
    const { data, error } = await client().from('field_issue_report_settings').select('*').eq('project_id', pid()).maybeSingle();
    if (error) { note(`❌ ${/relation|does not exist/i.test(error.message) ? 'run the field issue SQL in Supabase first' : error.message}`); return; }
    const r = { ...reportDefaults(), ...(data || {}) };
    document.getElementById('fiReportModal')?.remove();
    const m = document.createElement('div'); m.id = 'fiReportModal'; m.className = 'fi-modal';
    const inp = (id, label, val, extra = '') => `<label>${label}<input id="${id}" class="form-input" value="${esc(val || '')}" ${extra}></label>`;
    m.innerHTML = `<div class="fi-modal-box" style="width:min(560px,100%)">
        <h3>✉ Weekly Field Issues e-mail</h3>
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="fiRepOn" ${r.enabled ? 'checked' : ''}> Send automatically</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <label>Day<select id="fiRepDay" class="form-select">${DAYS.map((d, k) => `<option value="${k}" ${Number(r.weekday) === k ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
          ${inp('fiRepTime', 'Time (Eastern)', r.send_time, 'type="time"')}
        </div>
        <label>Recipients (comma separated)<textarea id="fiRepTo" class="form-input" rows="2" placeholder="name@company.com, gc@company.com">${esc(r.recipients)}</textarea></label>
        ${inp('fiRepSubject', 'Subject', r.subject)}
        <label>Body<textarea id="fiRepBody" class="form-input" rows="12">${esc(r.body)}</textarea></label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${inp('fiRepName', 'Sender', r.sender_name, 'readonly')}${inp('fiRepTitle', 'Contact e-mail for questions', r.sender_title, 'type="email"')}
        </div>
        <div class="fi-muted fi-small">Fields: {project} {date} {resolved_week} {open_count} {old_count} {contact_email}. Only this project's issues are included; the PDF report is attached.${r.last_sent_at ? ' Last sent: ' + fmt(r.last_sent_at) : ''}</div>
        <div class="fi-modal-actions" style="flex-wrap:wrap"><button type="button" class="btn btn-secondary" onclick="fiReportRun('pdf', this)">📄 Preview PDF</button><button type="button" class="btn btn-secondary" onclick="fiReportRun('test', this)">✉ Send test to me</button><button type="button" class="btn btn-secondary" onclick="fiReportDefaults()">Restore default text</button><button type="button" class="btn btn-secondary" onclick="document.getElementById('fiReportModal').remove()">Cancel</button><button type="button" class="btn btn-primary" onclick="fiReportSave(this)">Save</button></div>
      </div>`;
    document.body.appendChild(m);
  };
  // Preview the PDF or e-mail a test to yourself (uses the saved settings: save first).
  window.fiReportRun = async (action, btn) => {
    const old = btn.textContent; btn.disabled = true; btn.textContent = 'Working…';
    try {
      const { data: { session } } = await client().auth.getSession();
      const r = await fetch('/.netlify/functions/fi-report', { method: 'POST', signal: AbortSignal.timeout(30000), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session?.access_token || '') }, body: JSON.stringify({ action, projectId: pid() }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      if (action === 'pdf') {
        const bytes = Uint8Array.from(atob(j.pdf), c => c.charCodeAt(0));
        showPdf(bytes, j.filename);
      } else note(`✅ Test sent to ${j.sentTo}`);
    } catch (e) { note(`❌ ${e.message}`); }
    finally { btn.disabled = false; btn.textContent = old; }
  };
  // Shows a PDF inside the page (no pop-up to block) with Print, Download and Close.
  const showPdf = (bytes, filename, autoPrint) => {
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    document.getElementById('fiPdfPreview')?.remove();
    const v = document.createElement('div'); v.id = 'fiPdfPreview'; v.className = 'fi-modal'; v.style.zIndex = '10001';
    v.innerHTML = `<div class="fi-modal-box" style="width:min(900px,100%);height:90vh;grid-template-rows:auto 1fr">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><strong style="flex:1">${esc(filename || 'Report')}</strong><button type="button" class="btn btn-primary" id="fiPdfPrint">🖨 Print</button><a class="btn btn-secondary" href="${url}" download="${esc(filename || 'Field_Issues.pdf')}">⬇ Download</a><button type="button" class="btn btn-secondary" onclick="document.getElementById('fiPdfPreview').remove()">Close</button></div>
        <iframe id="fiPdfFrame" src="${url}" title="Report preview" style="width:100%;height:100%;border:1px solid #E2E8F0;border-radius:8px"></iframe></div>`;
    document.body.appendChild(v);
    const print = () => { try { const f = document.getElementById('fiPdfFrame'); f.contentWindow.focus(); f.contentWindow.print(); } catch (_) { window.open(url, '_blank'); } };
    document.getElementById('fiPdfPrint').onclick = print;
    // Export PDF: open the print dialog right away, as before.
    if (autoPrint) document.getElementById('fiPdfFrame').addEventListener('load', () => setTimeout(print, 600), { once: true });
  };
  window.fiReportDefaults = () => { document.getElementById('fiRepSubject').value = DEFAULT_SUBJECT; document.getElementById('fiRepBody').value = DEFAULT_BODY; };
  window.fiReportSave = async btn => {
    const v = id => document.getElementById(id)?.value.trim() || '';
    const recipients = v('fiRepTo').split(/[,;\s]+/).filter(Boolean);
    const bad = recipients.filter(e => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    if (bad.length) { note(`Check these e-mails: ${bad.join(', ')}`); return; }
    const on = document.getElementById('fiRepOn').checked;
    if (on && !recipients.length) { note('Add at least one recipient'); return; }
    if (!v('fiRepSubject') || !v('fiRepBody')) { note('Subject and body are required'); return; }
    btn.disabled = true;
    const row = { project_id: pid(), enabled: on, weekday: Number(v('fiRepDay')), send_time: v('fiRepTime') || '18:00', timezone: 'America/New_York', recipients: recipients.join(', '), subject: v('fiRepSubject'), body: document.getElementById('fiRepBody').value, sender_name: 'Aireko QA/QC Automated System', sender_title: v('fiRepTitle'), company: 'Aireko', sender_phone: '', updated_by_name: userName(), updated_at: new Date().toISOString() };
    const { error } = await client().from('field_issue_report_settings').upsert(row, { onConflict: 'project_id' });
    btn.disabled = false;
    if (error) { note(`❌ ${error.message}`); return; }
    document.getElementById('fiReportModal')?.remove();
    note(on ? `✅ Weekly e-mail on: ${DAYS[row.weekday]} ${row.send_time}` : 'Weekly e-mail saved (off)');
  };
  // Used by the unit Closeout PDF.
  window.fiIssuesForUnit = async unit => { try { await load(); } catch (_) {} return issues.filter(i => i.apt === String(unit.apt) && (!unit.building || !i.building || i.building === unit.building)); };
  window.fiFilter = f => { filter = f; rerender(); };
  // Browsers sometimes autofill the signed-in e-mail here: never search by an e-mail.
  const looksLikeEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim());
  setInterval(() => { const el = document.getElementById('fiSearch'); if (el && looksLikeEmail(el.value)) { el.value = ''; if (search) window.fiSearchInput(''); } }, 800);
  window.fiSearchInput = v => { if (looksLikeEmail(v)) { const el = document.getElementById('fiSearch'); if (el) el.value = ''; v = ''; } search = String(v || '').toLowerCase().trim(); const host = document.getElementById('fiList'); if (host) host.innerHTML = visible(currentUnit).map(card).join('') || '<div class="fi-empty">No issues.</div>'; };

  let currentUnit = null;
  function rerender() {
    updateIssuesBadge();
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
  .fi-modal{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px}.fi-modal-box{background:#fff;border-radius:12px;padding:16px;width:min(440px,100%);max-height:90vh;overflow:auto;display:grid;gap:10px}.fi-modal-box h3{margin:0;font-size:16px}.fi-modal-box label{display:grid;gap:4px;font-size:13px;font-weight:600}.fi-modal-actions{display:flex;gap:8px;justify-content:flex-end}.fi-resolution{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:4px 8px;font-size:12px;color:#166534}
  .fi-card.fi-resolved{border-left-color:#16A34A;opacity:.85}.fi-card-head{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13px}
  .fi-chip{background:#FEF3C7;color:#92400E;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600}.fi-status{margin-left:auto;font-size:11px;font-weight:700;color:#64748B}
  .fi-desc{font-size:13px;color:#334155}.fi-meta{font-size:11px;color:#64748B}.fi-actions{display:flex;gap:6px;flex-wrap:wrap}.fi-actions .btn{font-size:12px;padding:4px 10px}
  .fi-empty{color:#64748B;padding:10px 0}
  .fi-row{display:flex;gap:10px;align-items:flex-start;border:1px solid #E2E8F0;border-left:4px solid #DC2626;border-radius:8px;padding:8px 10px;background:#fff;margin-bottom:6px}
  .fi-row.fi-resolved{border-left-color:#16A34A;opacity:.8}.fi-row-main{flex:1;min-width:0;display:grid;gap:3px}
  .fi-row-top{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:13px}.fi-comment{font-size:14px;font-weight:600;color:#0F172A;overflow-wrap:anywhere}
  .fi-muted{color:#64748B}.fi-small{font-size:11px}.fi-row-actions{display:flex;gap:4px;flex-shrink:0}
  .fi-icon{border:1px solid #E2E8F0;background:#F8FAFC;border-radius:6px;padding:4px 8px;font-size:13px;cursor:pointer;white-space:nowrap}.fi-icon:hover{background:#EFF6FF}.fi-del:hover{background:#FEE2E2}.fi-resolve{background:#DCFCE7;border-color:#86EFAC;color:#166534;font-weight:600}.fi-resolve:hover{background:#BBF7D0}.fi-reopen{background:#FEF3C7;border-color:#FCD34D;color:#92400E;font-weight:600}.fi-reopen:hover{background:#FDE68A}.fi-dl{display:inline-flex;align-items:center;justify-content:center;padding:4px 7px;background:#fff;border-color:#93C5FD;color:#1D4ED8}.fi-dl:hover{background:#EFF6FF}.fi-state{display:inline-flex;align-items:center;justify-content:center;padding:3px 6px;background:#fff}.fi-state:hover{background:#F8FAFC}
  .fi-unit-pick{position:relative}.fi-unit-results{display:none;position:absolute;left:0;right:0;top:100%;z-index:50;max-height:240px;overflow:auto;background:#fff;border:1px solid #CBD5E1;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.12)}
  .fi-unit-results button{display:block;width:100%;text-align:left;padding:8px 10px;border:0;background:#fff;font-size:13px;cursor:pointer}.fi-unit-results button:hover{background:#EFF6FF}
  .fi-wrap{max-width:900px}`;
  document.head.appendChild(css);
})();

// Photo lightbox: in-page preview with prev/next arrows and download
window.fiLightbox = function (urls, idx) {
  let i = idx || 0; document.getElementById('fiLb')?.remove();
  const d = document.createElement('div'); d.id = 'fiLb';
  d.innerHTML = `<div class="fi-lb-top"><span id="fiLbN"></span><button type="button" class="fi-lb-b" id="fiLbDl" title="Download"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 19h14"/></svg></button><button type="button" class="fi-lb-b" id="fiLbX" title="Close">✕</button></div>
    <button type="button" class="fi-lb-nav" id="fiLbP" title="Previous">‹</button><img id="fiLbImg" alt="Issue photo"><button type="button" class="fi-lb-nav" id="fiLbNx" title="Next">›</button>`;
  document.body.appendChild(d);
  const show = () => { document.getElementById('fiLbImg').src = urls[i]; document.getElementById('fiLbN').textContent = `${i + 1} / ${urls.length}`;
    const many = urls.length > 1; document.getElementById('fiLbP').hidden = !many; document.getElementById('fiLbNx').hidden = !many; };
  const go = n => { i = (i + n + urls.length) % urls.length; show(); };
  const close = () => { d.remove(); document.removeEventListener('keydown', key); };
  const key = e => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); };
  document.addEventListener('keydown', key);
  d.onclick = e => { if (e.target === d) close(); };
  document.getElementById('fiLbX').onclick = close;
  document.getElementById('fiLbP').onclick = () => go(-1);
  document.getElementById('fiLbNx').onclick = () => go(1);
  document.getElementById('fiLbDl').onclick = async () => {
    try { const b = await (await fetch(urls[i])).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b);
      a.download = (urls[i].split('/').pop().split('?')[0]) || `photo-${i + 1}.jpg`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    catch (_) { window.open(urls[i], '_blank'); } };
  let x0 = null; d.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  d.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; });
  show();
};
(function(){ const st = document.createElement('style'); st.textContent = `#fiLb{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.92);display:flex;align-items:center;justify-content:center}
#fiLbImg{max-width:88vw;max-height:84vh;object-fit:contain;border-radius:6px;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.fi-lb-top{position:absolute;top:12px;left:16px;right:16px;display:flex;align-items:center;gap:10px;color:#fff;font:600 14px system-ui}
.fi-lb-top span{flex:1}.fi-lb-b{width:38px;height:38px;border-radius:50%;border:0;background:#fff;color:#1D4ED8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}
#fiLbX{color:#0f172a}.fi-lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.9);font-size:30px;line-height:1;cursor:pointer;color:#0f172a}
#fiLbP{left:16px}#fiLbNx{right:16px}`; document.head.appendChild(st); })();
