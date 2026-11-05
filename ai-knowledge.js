/* Identus 50 · AI Knowledge Base — stage 1 (upload, registry, processing queue).
 * Kept in its own file so it cannot break Quantity Control or other modules.
 * Uses the app's existing globals: sbClient, PROJECT_ID, userRole,
 * quantityEnsurePdfJs, officialFinalEscape. No AI calls yet. */
(function () {
  'use strict';
  const BUCKET = 'ai-docs';
  const CATEGORIES = [
    { id: 'drawings', label: 'Drawings' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'rfi', label: 'RFI' },
    { id: 'other', label: 'Other Documents' }
  ];
  const STATUS = {
    pending: ['Queued', '#92400E', '#FFFBEB', '#FCD34D'],
    processing: ['Processing', '#1D4ED8', '#EFF6FF', '#93C5FD'],
    ready: ['Ready', '#166534', '#F0FDF4', '#86EFAC'],
    needs_review: ['Needs review', '#9A3412', '#FFF7ED', '#FDBA74'],
    error: ['Error', '#B91C1C', '#FEF2F2', '#FCA5A5']
  };
  let activeCategory = 'drawings';
  let documents = [];
  let tableMissing = false;
  let pageStats = {}; let relations = []; let editingId = null; let pollTimer = null;
  const esc = v => (typeof officialFinalEscape === 'function' ? officialFinalEscape(String(v ?? '')) : String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const canManage = () => window.userRole === 'admin' || window.userRole === 'pm';
  const client = () => (typeof sbClient !== 'undefined' ? sbClient : null);
  const projectId = () => (typeof PROJECT_ID !== 'undefined' ? PROJECT_ID : null);

  async function sha256(buffer) {
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function pageCount(buffer) {
    try {
      const pdfjs = await quantityEnsurePdfJs();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;
      const n = pdf.numPages; try { pdf.destroy(); } catch (_) {}
      return n;
    } catch (_) { return null; }
  }
  function safeName(name) { return String(name || 'document.pdf').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-120); }

  async function load() {
    const sb = client(); const pid = projectId();
    if (!sb || !pid) return;
    const { data, error } = await sb.from('ai_documents').select('id,category,file_name,storage_path,page_count,status,error,sheet_number,title,discipline,building,floor,revision,metadata,metadata_confirmed,is_current_revision,size_bytes,created_at').eq('project_id', pid).order('created_at', { ascending: false });
    if (error) { tableMissing = /ai_documents|PGRST205|42P01|does not exist/i.test(error.message || '') ; documents = []; if (!tableMissing) console.warn('AI Knowledge Base load failed', error); return; }
    tableMissing = false; documents = data || [];
    const pages = await sb.from('ai_document_pages').select('document_id,status').eq('project_id', pid);
    pageStats = {}; (pages.data || []).forEach(p => { const s = pageStats[p.document_id] || (pageStats[p.document_id] = { total: 0, ready: 0, error: 0 }); s.total++; if (p.status === 'ready') s.ready++; if (p.status === 'error') s.error++; });
    const rel = await sb.from('ai_relations').select('id,from_document_id,to_document_id,to_sheet,relation,source,confirmed').eq('project_id', pid);
    relations = rel.data || [];
    schedulePoll();
  }

  function chip(status) {
    const [label, fg, bg, border] = STATUS[status] || STATUS.pending;
    return `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;color:${fg};background:${bg};border:1px solid ${border};white-space:nowrap;">${label}</span>`;
  }

  function schedulePoll() {
    clearTimeout(pollTimer);
    const busy = documents.some(d => d.status === 'pending' || d.status === 'processing');
    if (busy && document.getElementById('aiKnowledgeBaseHost')?.offsetParent) pollTimer = setTimeout(() => refresh().catch(() => {}), 15000);
  }
  function metaLine(d) {
    const bits = [d.sheet_number && `<b>${esc(d.sheet_number)}</b>`, d.title && esc(d.title), d.discipline && esc(d.discipline), d.revision && `Rev ${esc(String(d.revision).replace(/^\s*rev(ision)?\.?\s*/i, ''))}`, d.building && esc(d.building), d.floor && esc(d.floor)].filter(Boolean);
    return bits.length ? `<div style="flex-basis:100%;font-size:11px;color:#334155;">${bits.join(' · ')}${d.metadata_confirmed ? ' <span style="color:#15803D;">✓ confirmed</span>' : (d.status === 'ready' || d.status === 'needs_review' ? ' <span style="color:#B45309;">· AI suggestion, not confirmed</span>' : '')}${d.is_current_revision ? ' <span style="color:#1D4ED8;font-weight:600;">· CURRENT REVISION</span>' : ''}</div>` : '';
  }
  function progress(d) {
    const s = pageStats[d.id]; if (!s || !s.total || d.status === 'ready') return '';
    return `<span style="color:#475569;font-size:11px;">${s.ready}/${s.total} pages read${s.error ? ` · ${s.error} failed` : ''}</span>`;
  }
  function editor(d) {
    if (editingId !== d.id) return '';
    const field = (key, label) => `<label style="display:flex;flex-direction:column;gap:2px;font-size:11px;color:#475569;">${label}<input id="aiKbEdit_${key}" value="${esc(d[key] || '')}" style="padding:5px 7px;border:1px solid #CBD5E1;border-radius:5px;font-size:12px;"></label>`;
    const rels = relations.filter(r => r.from_document_id === d.id);
    const docName = id => esc(documents.find(x => x.id === id)?.file_name || '');
    const relRows = rels.length ? rels.map(r => `<div style="display:flex;gap:6px;align-items:center;font-size:11px;"><span>${esc(r.relation)} <b>${esc(r.to_sheet || '')}</b>${r.to_document_id ? ` → ${docName(r.to_document_id)}` : ' <span style="color:#B45309;">(not uploaded)</span>'}</span>${r.confirmed ? '<span style="color:#15803D;">✓</span>' : `<button type="button" class="btn btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="aiKbRelation('${r.id}','confirm')">Confirm</button>`}<button type="button" class="btn btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="aiKbRelation('${r.id}','remove')">Remove</button></div>`).join('') : '<div style="font-size:11px;color:#94A3B8;">No related sheets found.</div>';
    return `<div style="flex-basis:100%;margin-top:6px;padding:10px;border:1px solid #C7D2FE;border-radius:6px;background:#fff;display:flex;flex-direction:column;gap:8px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;">${field('sheet_number', 'Sheet / Section / RFI #')}${field('title', 'Title')}${field('discipline', 'Discipline')}${field('revision', 'Revision')}${field('building', 'Building')}${field('floor', 'Floor')}</div>
      <div><div style="font-size:11px;font-weight:700;color:#3730A3;margin-bottom:4px;">Related sheets</div>${relRows}
        <div style="display:flex;gap:6px;margin-top:6px;"><input id="aiKbNewRel" placeholder="Add sheet, e.g. E201" style="padding:4px 6px;border:1px solid #CBD5E1;border-radius:5px;font-size:11px;width:150px;"><button type="button" class="btn btn-secondary" style="font-size:10px;padding:3px 7px;" onclick="aiKbAddRelation('${d.id}')">Add</button></div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <button type="button" class="btn btn-primary" style="font-size:11px;padding:5px 10px;" onclick="aiKbSaveMeta('${d.id}')">Confirm data</button>
        <button type="button" class="btn btn-secondary" style="font-size:11px;padding:5px 10px;" onclick="aiKbToggleCurrent('${d.id}')">${d.is_current_revision ? 'Unmark current revision' : 'Mark as current revision'}</button>
        <button type="button" class="btn btn-secondary" style="font-size:11px;padding:5px 10px;" onclick="aiKbEdit(null)">Close</button>
        <span style="font-size:11px;color:#64748B;">Confirming the data and marking the current revision are separate decisions.</span>
      </div></div>`;
  }

  function render() {
    const host = document.getElementById('aiKnowledgeBaseHost');
    if (!host) return;
    if (!canManage()) { host.style.display = 'none'; host.innerHTML = ''; return; }
    host.style.display = '';
    const counts = Object.fromEntries(CATEGORIES.map(c => [c.id, documents.filter(d => d.category === c.id).length]));
    const tabs = CATEGORIES.map(c => `<button type="button" class="btn ${c.id === activeCategory ? 'btn-primary' : 'btn-secondary'}" style="font-size:11px;padding:5px 10px;" onclick="aiKbSetCategory('${c.id}')">${esc(c.label)} (${counts[c.id]})</button>`).join('');
    const list = documents.filter(d => d.category === activeCategory);
    const rows = list.length ? list.map(d => `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 10px;border:1px solid #E2E8F0;border-radius:6px;background:#F8FAFC;font-size:12px;">
        <strong style="flex:1;min-width:180px;overflow-wrap:anywhere;color:#1E293B;">${esc(d.file_name)}</strong>
        <span style="color:#64748B;">${d.page_count ? `${d.page_count} page${d.page_count === 1 ? '' : 's'}` : '—'}</span>
        <span style="color:#64748B;">${d.created_at && !isNaN(Date.parse(d.created_at)) ? new Date(d.created_at).toLocaleDateString() : ''}</span>
        ${chip(d.status)}${progress(d)}${d.error ? `<span style="color:#B91C1C;font-size:11px;">${esc(d.error)}</span>` : ''}
        <button type="button" class="btn btn-secondary" style="font-size:11px;padding:4px 8px;" onclick="aiKbOpen('${d.id}')">View</button>
        ${d.status === 'ready' || d.status === 'needs_review' || d.status === 'error' ? `<button type="button" class="btn btn-secondary" style="font-size:11px;padding:4px 8px;" onclick="aiKbEdit('${d.id}')">Review</button>` : ''}
        ${d.status === 'error' ? `<button type="button" class="btn btn-secondary" style="font-size:11px;padding:4px 8px;" onclick="aiKbRetry('${d.id}')">Retry</button>` : ''}
        <button type="button" class="btn btn-danger" style="font-size:11px;padding:4px 8px;" onclick="aiKbDelete('${d.id}')">Remove</button>
        ${metaLine(d)}${editor(d)}
      </div>`).join('') : `<div style="font-size:12px;color:#94A3B8;padding:6px 0;">No ${esc(CATEGORIES.find(c => c.id === activeCategory).label)} uploaded yet.</div>`;
    const review = documents.filter(d => d.status === 'needs_review' || d.status === 'error').length;
    const busyCount = documents.filter(d => d.status === 'pending' || d.status === 'processing').length;
    const alerts = (review ? `<div style="padding:7px 10px;border:1px solid #FDBA74;background:#FFF7ED;color:#9A3412;border-radius:6px;font-size:12px;">⚠️ ${review} document(s) need review. Open them with <b>Review</b> to correct or confirm the data.</div>` : '') + (busyCount ? `<div style="padding:7px 10px;border:1px solid #BFDBFE;background:#EFF6FF;color:#1D4ED8;border-radius:6px;font-size:12px;">⏳ The AI is reading ${busyCount} document(s) in the background. You can close Setup; it keeps going.</div>` : '');
    const missing = tableMissing ? `<div style="padding:8px 10px;border:1px solid #FCD34D;background:#FFFBEB;color:#92400E;border-radius:6px;font-size:12px;">The AI Knowledge Base tables are not in Supabase yet. Run <strong>20261104_ai_knowledge_base.sql</strong> in the Supabase SQL editor, then reopen Setup.</div>` : '';
    host.setAttribute('data-no-translate', '');
    host.innerHTML = `<details id="aiKnowledgeBaseDetails" open style="border:1px solid #C7D2FE;border-radius:8px;overflow:hidden;background:#F8F9FF;margin-top:10px;">
      <summary style="padding:10px 14px;cursor:pointer;font-weight:700;color:#3730A3;font-size:13px;">🤖 AI Knowledge Base <span style="font-weight:400;color:#64748B;font-size:11px;">· documents the AI assistant will use for this project</span></summary>
      <div style="padding:14px;display:flex;flex-direction:column;gap:10px;background:#fff;">
        ${missing}${alerts}
        <div style="display:flex;gap:6px;flex-wrap:wrap;">${tabs}</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <label class="btn btn-secondary" style="font-size:11px;padding:6px 10px;cursor:pointer;${tableMissing ? 'opacity:.5;pointer-events:none;' : ''}">📎 Upload PDFs to ${esc(CATEGORIES.find(c => c.id === activeCategory).label)}<input id="aiKbInput" type="file" multiple accept="application/pdf,.pdf" onchange="aiKbUpload(this)" style="display:none"></label>
          <span id="aiKbMessage" style="font-size:11px;color:#475569;">Files are stored privately for this project only. Identical files are skipped.</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">${rows}</div>
      </div></details>`;
  }

  async function refresh() { await load(); render(); }

  async function upload(input) {
    if (!canManage()) return;
    const files = Array.from(input?.files || []); if (input) input.value = '';
    const sb = client(); const pid = projectId(); const category = activeCategory;
    const msg = () => document.getElementById('aiKbMessage');
    if (!files.length || !sb || !pid) return;
    let done = 0, skipped = 0, failed = 0;
    for (const file of files) {
      const m = msg(); if (m) { m.textContent = `Uploading ${done + skipped + failed + 1} of ${files.length}: ${file.name}…`; m.style.color = '#1D4ED8'; }
      try {
        if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) { failed++; continue; }
        const buffer = await file.arrayBuffer();
        const hash = await sha256(buffer);
        const existing = await sb.from('ai_documents').select('id').eq('project_id', pid).eq('sha256', hash).limit(1);
        if (existing.data?.length) { skipped++; continue; }
        const pages = await pageCount(buffer);
        const path = `${pid}/${category}/${hash.slice(0, 12)}_${safeName(file.name)}`;
        const up = await sb.storage.from(BUCKET).upload(path, file, { contentType: 'application/pdf', upsert: false });
        if (up.error && !/exists/i.test(up.error.message || '')) throw up.error;
        const ins = await sb.from('ai_documents').insert({ project_id: pid, category, file_name: file.name, storage_path: path, mime_type: 'application/pdf', size_bytes: file.size, sha256: hash, page_count: pages, status: 'pending' }).select('id').single();
        if (ins.error) throw ins.error;
        if (pages) {
          const pageRows = Array.from({ length: pages }, (_, i) => ({ project_id: pid, document_id: ins.data.id, page_number: i + 1 }));
          for (let i = 0; i < pageRows.length; i += 200) { const r = await sb.from('ai_document_pages').insert(pageRows.slice(i, i + 200)); if (r.error) throw r.error; }
        }
        done++;
      } catch (error) {
        failed++; console.error('AI Knowledge Base upload failed', file.name, error);
      }
    }
    await refresh();
    const m = msg(); if (m) { m.textContent = `✓ ${done} uploaded${skipped ? ` · ${skipped} already in the project (skipped)` : ''}${failed ? ` · ${failed} failed (PDF only; check the console)` : ''}. The AI will read them in the background (about one page every few seconds).`; m.style.color = failed ? '#B91C1C' : '#15803D'; }
  }

  async function openDoc(id) {
    const d = documents.find(x => x.id === id); const sb = client(); if (!d || !sb) return;
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(d.storage_path, 600);
    if (error || !data?.signedUrl) { if (typeof toast === 'function') toast('❌ Could not open the document'); return; }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  async function removeDoc(id) {
    if (!canManage()) return;
    const d = documents.find(x => x.id === id); const sb = client(); if (!d || !sb) return;
    if (!confirm(`Remove "${d.file_name}" from the AI Knowledge Base? The AI will stop using it. This cannot be undone.`)) return;
    const del = await sb.from('ai_documents').delete().eq('id', id);
    if (del.error) { if (typeof toast === 'function') toast(`❌ ${del.error.message}`); return; }
    await sb.storage.from(BUCKET).remove([d.storage_path]);
    await refresh();
  }

  async function saveMeta(id) {
    const sb = client(); if (!canManage() || !sb) return;
    const val = k => (document.getElementById(`aiKbEdit_${k}`)?.value || '').trim() || null;
    const patch = { sheet_number: val('sheet_number'), title: val('title'), discipline: val('discipline'), revision: val('revision'), building: val('building'), floor: val('floor'), metadata_confirmed: true, status: 'ready', updated_at: new Date().toISOString() };
    const r = await sb.from('ai_documents').update(patch).eq('id', id);
    if (r.error) { if (typeof toast === 'function') toast(`❌ ${r.error.message}`); return; }
    editingId = null; await refresh(); if (typeof toast === 'function') toast('✅ Document data confirmed');
  }
  async function toggleCurrent(id) {
    const sb = client(); const d = documents.find(x => x.id === id); if (!canManage() || !sb || !d) return;
    const next = !d.is_current_revision;
    if (next && !confirm(`Mark "${d.file_name}" as the CURRENT revision${d.sheet_number ? ` of ${d.sheet_number}` : ''}? Other documents with the same sheet stop being current; they are kept as previous revisions.`)) return;
    if (next && d.sheet_number) { const others = documents.filter(x => x.id !== id && x.is_current_revision && x.sheet_number && x.sheet_number.toUpperCase() === d.sheet_number.toUpperCase()); for (const o of others) await sb.from('ai_documents').update({ is_current_revision: false }).eq('id', o.id); }
    const r = await sb.from('ai_documents').update({ is_current_revision: next, current_approved_at: next ? new Date().toISOString() : null }).eq('id', id);
    if (r.error) { if (typeof toast === 'function') toast(`❌ ${r.error.message}`); return; }
    await refresh();
  }
  async function retry(id) {
    const sb = client(); if (!canManage() || !sb) return;
    await sb.from('ai_document_pages').update({ status: 'pending', attempts: 0, error: null }).eq('document_id', id).eq('status', 'error');
    await sb.from('ai_documents').update({ status: 'pending', error: null }).eq('id', id);
    await refresh();
  }
  async function relationAction(id, action) {
    const sb = client(); if (!canManage() || !sb) return;
    const r = action === 'remove' ? await sb.from('ai_relations').delete().eq('id', id) : await sb.from('ai_relations').update({ confirmed: true }).eq('id', id);
    if (r.error) { if (typeof toast === 'function') toast(`❌ ${r.error.message}`); return; }
    await refresh();
  }
  async function addRelation(id) {
    const sb = client(); const d = documents.find(x => x.id === id); const input = document.getElementById('aiKbNewRel');
    const sheet = String(input?.value || '').trim().toUpperCase(); if (!canManage() || !sb || !d || !sheet) return;
    const target = documents.find(x => x.id !== id && String(x.sheet_number || '').toUpperCase() === sheet);
    const r = await sb.from('ai_relations').insert({ project_id: projectId(), from_document_id: id, to_document_id: target?.id || null, to_sheet: sheet, relation: d.category === 'rfi' ? 'affects' : 'references', source: 'manual', confirmed: true });
    if (r.error) { if (typeof toast === 'function') toast(`❌ ${r.error.message}`); return; }
    await refresh();
  }

  window.aiKbEdit = id => { editingId = id; render(); };
  window.aiKbSaveMeta = id => saveMeta(id);
  window.aiKbToggleCurrent = id => toggleCurrent(id);
  window.aiKbRetry = id => retry(id);
  window.aiKbRelation = (id, action) => relationAction(id, action);
  window.aiKbAddRelation = id => addRelation(id);
  window.aiKbRender = () => { render(); refresh().catch(error => console.warn('AI Knowledge Base', error)); };
  window.aiKbSetCategory = id => { activeCategory = id; render(); };
  window.aiKbUpload = input => upload(input).catch(error => console.error(error));
  window.aiKbOpen = id => openDoc(id);
  window.aiKbDelete = id => removeDoc(id);

  // ---------------- Floating AI assistant (stage 3) ----------------
  let chatConversationId = null; let chatBusy = false; let chatRecognition = null;
  function chatContext() {
    const ctx = { tab: (document.querySelector('.tab-main.active')?.textContent || '').trim().slice(0, 40) };
    try { if (typeof quantityCurrentUnit !== 'undefined' && quantityCurrentUnit) { ctx.unit = quantityCurrentUnit.apt; ctx.building = quantityCurrentUnit.building; ctx.floor = quantityCurrentUnit.floor; ctx.system = quantityCurrentSystem; } } catch (_) {}
    return ctx;
  }
  function chatEnsure() {
    if (document.getElementById('aiChatFab')) return;
    const style = document.createElement('style');
    style.textContent = `#aiChatFab{position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:10080;width:54px;height:54px;border-radius:50%;border:0;background:#3730A3;color:#fff;font-size:24px;cursor:pointer;box-shadow:0 6px 18px rgba(15,23,42,.3)}
#aiChatPanel{position:fixed;right:calc(18px + env(safe-area-inset-right,0px));bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:10080;width:min(410px,calc(100vw - 36px));height:min(600px,calc(100vh - 190px));background:#fff;border:1px solid #C7D2FE;border-radius:12px;box-shadow:0 14px 36px rgba(15,23,42,.25);display:flex;flex-direction:column;overflow:hidden;font-size:13px}
#aiChatPanel[hidden]{display:none}
#aiChatPanel .h{padding:10px 12px;background:#EEF2FF;border-bottom:1px solid #C7D2FE;display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
#aiChatPanel .h small{display:block;color:#64748B;font-size:11px;margin-top:2px}
#aiChatMsgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.aic-m{max-width:90%;padding:8px 11px;border-radius:10px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
.aic-u{align-self:flex-end;background:#3730A3;color:#fff}.aic-a{align-self:flex-start;background:#F1F5F9;color:#0F172A}
.aic-cite{display:inline-block;margin:4px 4px 0 0;padding:2px 7px;border:1px solid #C7D2FE;border-radius:5px;background:#fff;color:#3730A3;font-size:11px;cursor:pointer}
#aiChatForm{display:flex;gap:6px;padding:9px;border-top:1px solid #E2E8F0}
#aiChatInput{flex:1;min-width:0;padding:9px 10px;border:1px solid #CBD5E1;border-radius:8px;font:inherit}
#aiChatForm button{border:0;border-radius:8px;padding:0 12px;cursor:pointer;font-weight:600}
.aic-hbtn{border:1px solid #C7D2FE;background:#fff;color:#3730A3;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:600;cursor:pointer}
.aic-h{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid #E2E8F0;border-radius:8px;cursor:pointer;background:#fff}
.aic-h:hover{background:#EEF2FF}.aic-h b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;color:#1E293B}
.aic-h small{color:#64748B;font-size:11px;white-space:nowrap}
@media (max-width:520px){#aiChatPanel{right:0;left:0;bottom:0;width:100%;height:100%;border-radius:0}}`;
    document.head.appendChild(style);
    const fab = document.createElement('button'); fab.id = 'aiChatFab'; fab.type = 'button'; fab.title = 'AI assistant'; fab.setAttribute('aria-label', 'Open the AI assistant'); fab.textContent = '💬';
    const panel = document.createElement('section'); panel.id = 'aiChatPanel'; panel.hidden = true; panel.setAttribute('data-no-translate', '');
    panel.innerHTML = `<div class="h"><div><strong style="color:#3730A3;">AI Assistant</strong><small id="aiChatCtx"></small></div><div style="display:flex;gap:6px;align-items:center;"><button type="button" class="aic-hbtn" onclick="aiChatNew()">＋ New chat</button><button type="button" class="aic-hbtn" id="aiChatHistBtn" onclick="aiChatHistory()">🕘 History</button><button type="button" aria-label="Close" onclick="aiChatToggle(false)" style="border:0;background:none;cursor:pointer;font-size:20px;color:#64748B;">×</button></div></div>
      <div id="aiChatMsgs"></div>
      <form id="aiChatForm"><button type="button" id="aiChatMic" title="Speak" style="background:#EEF2FF;color:#3730A3;">🎤</button><input id="aiChatInput" autocomplete="off" placeholder="Ask about drawings, specs, RFIs, code…"><button type="submit" style="background:#3730A3;color:#fff;">Send</button></form>`;
    document.body.appendChild(fab); document.body.appendChild(panel);
    fab.onclick = () => aiChatToggle();
    panel.querySelector('#aiChatForm').onsubmit = event => { event.preventDefault(); chatAsk(); };
    panel.querySelector('#aiChatMic').onclick = chatMic;
    chatAdd('a', 'Hi! Ask me about this project’s drawings, specifications, RFIs or electrical code. I cite the sheet, revision and page I use.');
  }
  function chatAdd(who, text, citations) {
    const box = document.getElementById('aiChatMsgs'); if (!box) return null;
    const el = document.createElement('div'); el.className = `aic-m aic-${who}`; el.textContent = text;
    if (citations?.length) {
      const wrap = document.createElement('div');
      citations.forEach(c => { const b = document.createElement('span'); b.className = 'aic-cite'; b.title = 'Open document'; b.textContent = `[${c.ref}] ${c.sheet || c.file || ''}${c.revision ? ` · Rev ${String(c.revision).replace(/^\s*rev(ision)?\.?\s*/i, '')}` : ''} · p.${c.page || 1}${c.current ? ' · current' : ''}`; b.onclick = () => chatOpenCitation(c); wrap.appendChild(b); });
      el.appendChild(wrap);
    }
    box.appendChild(el); box.scrollTop = box.scrollHeight; return el;
  }
  async function chatOpenCitation(c) {
    const sb = client(); if (!sb || !c.documentId) return;
    let path = documents.find(d => d.id === c.documentId)?.storage_path;
    if (!path) { const r = await sb.from('ai_documents').select('storage_path').eq('id', c.documentId).maybeSingle(); path = r.data?.storage_path; }
    if (!path) return;
    const { data } = await sb.storage.from(BUCKET).createSignedUrl(path, 600);
    if (data?.signedUrl) window.open(`${data.signedUrl}#page=${c.page || 1}`, '_blank', 'noopener');
  }
  async function chatAsk() {
    const input = document.getElementById('aiChatInput'); const question = String(input?.value || '').trim();
    if (!question || chatBusy) return;
    chatBusy = true; input.value = ''; chatAdd('u', question); const waiting = chatAdd('a', '…');
    try {
      const token = window.getAccessToken ? await window.getAccessToken() : null;
      if (!token) throw new Error('Your session expired. Sign in again.');
      const response = await fetch('/.netlify/functions/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, apikey: (typeof SUPABASE_KEY !== 'undefined' ? SUPABASE_KEY : '') }, body: JSON.stringify({ projectId: projectId(), question, conversationId: chatConversationId, context: chatContext() }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Error ${response.status}`);
      chatConversationId = body.conversationId || chatConversationId;
      waiting.remove(); chatAdd('a', body.answer, body.citations);
    } catch (error) { waiting.textContent = `⚠️ ${error.message}`; }
    finally { chatBusy = false; }
  }
  function chatMic() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { chatAdd('a', 'Voice input is not available in this browser. Use the keyboard dictation button instead.'); return; }
    if (chatRecognition) { chatRecognition.stop(); return; }
    const rec = new Rec(); chatRecognition = rec;
    rec.lang = (document.documentElement.lang || navigator.language || 'es-US').startsWith('en') ? 'en-US' : 'es-US';
    rec.interimResults = true; const input = document.getElementById('aiChatInput'); const mic = document.getElementById('aiChatMic');
    mic.textContent = '⏺️';
    rec.onresult = e => { input.value = Array.from(e.results).map(r => r[0].transcript).join(' '); };
    rec.onend = () => { chatRecognition = null; mic.textContent = '🎤'; if (input.value.trim()) chatAsk(); };
    rec.onerror = () => { chatRecognition = null; mic.textContent = '🎤'; };
    rec.start();
  }
  window.aiChatToggle = force => {
    chatEnsure(); const panel = document.getElementById('aiChatPanel');
    panel.hidden = force === undefined ? !panel.hidden : !force;
    if (!panel.hidden) { const c = chatContext(); document.getElementById('aiChatCtx').textContent = [c.tab, c.unit && `Unit ${c.unit}`, c.system].filter(Boolean).join(' · '); document.getElementById('aiChatInput').focus(); }
  };
  let chatView = 'chat';
  function chatShowForm(show) { const f = document.getElementById('aiChatForm'); if (f) f.style.display = show ? '' : 'none'; }
  window.aiChatNew = () => { chatConversationId = null; chatView = 'chat'; chatShowForm(true); const box = document.getElementById('aiChatMsgs'); if (box) box.innerHTML = ''; chatAdd('a', 'New conversation. What do you need?'); document.getElementById('aiChatInput')?.focus(); };
  // History: the user's own conversations for this project (RLS: only theirs).
  window.aiChatHistory = async () => {
    const sb = client(); const box = document.getElementById('aiChatMsgs'); if (!sb || !box) return;
    if (chatView === 'history') { chatView = 'chat'; chatShowForm(true); if (chatConversationId) return aiChatOpen(chatConversationId); return aiChatNew(); }
    chatView = 'history'; chatShowForm(false);
    box.innerHTML = '<div style="color:#64748B;font-size:12px;">Loading history…</div>';
    const { data, error } = await sb.from('ai_conversations').select('id,title,updated_at,created_at').eq('project_id', projectId()).order('updated_at', { ascending: false }).limit(50);
    if (chatView !== 'history') return;
    if (error) { box.innerHTML = `<div style="color:#B91C1C;font-size:12px;">${esc(error.message)}</div>`; return; }
    if (!data?.length) { box.innerHTML = '<div style="color:#64748B;font-size:12px;">No conversations yet.</div>'; return; }
    const when = v => { const d = new Date(v); return isNaN(d) ? '' : d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
    box.innerHTML = '<div style="font-size:11px;font-weight:700;color:#3730A3;text-transform:uppercase;letter-spacing:.05em;">Your conversations</div>' + data.map(c => `<div class="aic-h" onclick="aiChatOpen('${c.id}')"><b title="${esc(c.title || '')}">${esc(c.title || 'Conversation')}</b><small>${when(c.updated_at || c.created_at)}</small><button type="button" title="Delete" onclick="event.stopPropagation();aiChatDelete('${c.id}')" style="border:0;background:none;cursor:pointer;color:#94A3B8;font-size:14px;">🗑</button></div>`).join('');
  };
  window.aiChatOpen = async id => {
    const sb = client(); const box = document.getElementById('aiChatMsgs'); if (!sb || !box) return;
    chatView = 'chat'; chatShowForm(true); chatConversationId = id; box.innerHTML = '';
    const { data, error } = await sb.from('ai_messages').select('role,content,citations,created_at').eq('conversation_id', id).order('created_at', { ascending: true }).limit(200);
    if (error) { chatAdd('a', `⚠️ ${error.message}`); return; }
    (data || []).forEach(m => chatAdd(m.role === 'user' ? 'u' : 'a', m.content, m.role === 'assistant' ? m.citations : null));
    if (!data?.length) chatAdd('a', 'This conversation is empty.');
  };
  window.aiChatDelete = async id => {
    const sb = client(); if (!sb || !confirm('Delete this conversation? This cannot be undone.')) return;
    const r = await sb.from('ai_conversations').delete().eq('id', id);
    if (r.error) { if (typeof toast === 'function') toast(`❌ ${r.error.message}`); return; }
    if (chatConversationId === id) chatConversationId = null;
    chatView = 'chat'; window.aiChatHistory();
  };
  // Show the button only to Admin / PM, once the session role is known.
  function chatBoot(tries = 0) {
    if (canManage()) { chatEnsure(); return; }
    if (tries < 40) setTimeout(() => chatBoot(tries + 1), 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => chatBoot()); else chatBoot();
})();
