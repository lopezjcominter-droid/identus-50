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
    const { data, error } = await sb.from('ai_documents').select('id,category,file_name,storage_path,page_count,status,error,sheet_number,revision,size_bytes,created_at').eq('project_id', pid).order('created_at', { ascending: false });
    if (error) { tableMissing = /ai_documents|PGRST205|42P01|does not exist/i.test(error.message || '') ; documents = []; if (!tableMissing) console.warn('AI Knowledge Base load failed', error); return; }
    tableMissing = false; documents = data || [];
  }

  function chip(status) {
    const [label, fg, bg, border] = STATUS[status] || STATUS.pending;
    return `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;color:${fg};background:${bg};border:1px solid ${border};white-space:nowrap;">${label}</span>`;
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
        ${chip(d.status)}${d.error ? `<span style="color:#B91C1C;font-size:11px;">${esc(d.error)}</span>` : ''}
        <button type="button" class="btn btn-secondary" style="font-size:11px;padding:4px 8px;" onclick="aiKbOpen('${d.id}')">View</button>
        <button type="button" class="btn btn-danger" style="font-size:11px;padding:4px 8px;" onclick="aiKbDelete('${d.id}')">Remove</button>
      </div>`).join('') : `<div style="font-size:12px;color:#94A3B8;padding:6px 0;">No ${esc(CATEGORIES.find(c => c.id === activeCategory).label)} uploaded yet.</div>`;
    const missing = tableMissing ? `<div style="padding:8px 10px;border:1px solid #FCD34D;background:#FFFBEB;color:#92400E;border-radius:6px;font-size:12px;">The AI Knowledge Base tables are not in Supabase yet. Run <strong>20261104_ai_knowledge_base.sql</strong> in the Supabase SQL editor, then reopen Setup.</div>` : '';
    host.innerHTML = `<details id="aiKnowledgeBaseDetails" open style="border:1px solid #C7D2FE;border-radius:8px;overflow:hidden;background:#F8F9FF;margin-top:10px;">
      <summary style="padding:10px 14px;cursor:pointer;font-weight:700;color:#3730A3;font-size:13px;">🤖 AI Knowledge Base <span style="font-weight:400;color:#64748B;font-size:11px;">· documents the AI assistant will use for this project</span></summary>
      <div style="padding:14px;display:flex;flex-direction:column;gap:10px;background:#fff;">
        ${missing}
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
    const m = msg(); if (m) { m.textContent = `✓ ${done} uploaded${skipped ? ` · ${skipped} already in the project (skipped)` : ''}${failed ? ` · ${failed} failed (PDF only; check the console)` : ''}. Processing with AI starts in the next stage.`; m.style.color = failed ? '#B91C1C' : '#15803D'; }
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

  window.aiKbRender = () => { render(); refresh().catch(error => console.warn('AI Knowledge Base', error)); };
  window.aiKbSetCategory = id => { activeCategory = id; render(); };
  window.aiKbUpload = input => upload(input).catch(error => console.error(error));
  window.aiKbOpen = id => openDoc(id);
  window.aiKbDelete = id => removeDoc(id);
})();
