// Branded Excel reports (QA/QC progress and Field Issues), built with ExcelJS
(function () {
// Shared builder: used for the sample here and pasted into the app
function buildQaqcWorkbook(ExcelJS, o) {
  const { project, address, data, SYSTEMS, lines, logo, today } = o;
  const wb = new ExcelJS.Workbook(); wb.creator = 'Aireko QA/QC';
  const NAVY = 'FF0B3D6B', BLUE = 'FF1D4ED8', SLATE = 'FF475569', LIGHT = 'FFF8FAFC', ZEBRA = 'FFF1F5F9', WHITE = 'FFFFFFFF', LINE = 'FFE2E8F0';
  const fillFor = p => p >= 100 ? 'FFD1FAE5' : p > 0 ? 'FFDBEAFE' : 'FFFEE2E2';
  const fontFor = p => p >= 100 ? 'FF065F46' : p > 0 ? 'FF1E3A8A' : 'FF991B1B';
  const statusOf = p => p >= 100 ? 'Completed' : p > 0 ? 'In Progress' : 'Not Started';
  const thin = { style: 'thin', color: { argb: LINE } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };
  const fill = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  const dateTxt = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const logoId = logo ? wb.addImage({ base64: logo, extension: 'png' }) : null;
  const banner = (ws, subtitle, cols) => {
    for (const r of [1, 2, 3]) { ws.getRow(r).height = r === 1 ? 30 : 18; for (let c = 1; c <= cols; c++) ws.getCell(r, c).fill = fill(WHITE); }
    if (logoId != null) ws.addImage(logoId, { tl: { col: 0.15, row: 0.25 }, ext: { width: 120, height: 46 } });
    ws.mergeCells(1, 3, 1, cols); const t = ws.getCell(1, 3); t.value = project; t.font = { name: 'Calibri', bold: true, size: 18, color: { argb: NAVY } }; t.alignment = { horizontal: 'right', vertical: 'middle' };
    ws.mergeCells(2, 3, 2, cols); const s = ws.getCell(2, 3); s.value = subtitle; s.font = { bold: true, size: 11, color: { argb: BLUE } }; s.alignment = { horizontal: 'right' };
    ws.mergeCells(3, 3, 3, cols); const a = ws.getCell(3, 3); a.value = `${address ? address + '  ·  ' : ''}${dateTxt}`; a.font = { size: 10, color: { argb: SLATE } }; a.alignment = { horizontal: 'right' };
    ws.getRow(4).height = 6; for (let c = 1; c <= cols; c++) ws.getCell(4, c).fill = fill(NAVY);
    ws.addRow([]);
  };
  const header = row => { row.height = 30; row.eachCell(c => { c.font = { bold: true, color: { argb: WHITE } }; c.fill = fill(NAVY); c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = border; }); };
  const section = (ws, text, cols) => { const r = ws.addRow([text]); ws.mergeCells(r.number, 1, r.number, cols); r.getCell(1).font = { bold: true, size: 12, color: { argb: NAVY } }; r.getCell(1).border = { bottom: { style: 'medium', color: { argb: BLUE } } }; r.height = 22; };
  const zebra = (row, i) => row.eachCell({ includeEmpty: true }, c => { c.border = border; if (!c.fill || c.fill.fgColor?.argb === undefined) c.fill = fill(i % 2 ? ZEBRA : WHITE); });
  const bar = p => '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10));
  const systems = SYSTEMS.filter(sys => data.some(u => u.systems && u.systems[sys]));
  const footer = ws => { ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '6:6', margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.25 } };
    ws.headerFooter = { oddFooter: `&L&8Aireko Energy Group · Confidential – for project use only&C&8${project}&R&8Page &P of &N` }; };

  // 1) Summary
  const sum = wb.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  sum.columns = [{ width: 28 }, { width: 16 }, { width: 18 }, { width: 18 }, { width: 22 }];
  banner(sum, 'QA/QC PROGRESS REPORT', 5);
  if (lines.length) { section(sum, 'Project information', 5); lines.forEach((l, i) => { const [k, ...v] = String(l).split(':'); const r = sum.addRow([v.length ? k.trim() : '', v.length ? v.join(':').trim() : l]); sum.mergeCells(r.number, 2, r.number, 5); r.getCell(1).font = { bold: true, color: { argb: SLATE } }; r.getCell(2).font = { color: { argb: 'FF0F172A' } }; zebra(r, i); }); sum.addRow([]); }
  let tp = 0, tn = 0; const units = { done: 0, prog: 0, none: 0 }; const byB = {}, bySys = {};
  data.forEach(u => {
    const vals = Object.values(u.systems || {}).map(x => Number(x.progress) || 0);
    const avg = vals.length ? vals.reduce((a, v) => a + v, 0) / vals.length : 0;
    units[avg >= 100 ? 'done' : vals.some(v => v > 0) ? 'prog' : 'none']++;
    const b = byB[u.building] = byB[u.building] || { n: 0, tp: 0, tn: 0 }; b.n++;
    Object.entries(u.systems || {}).forEach(([sys, x]) => { const p = Number(x.progress) || 0; tp += p; tn++; b.tp += p; b.tn++; const y = bySys[sys] = bySys[sys] || { tp: 0, tn: 0, done: 0 }; y.tp += p; y.tn++; if (p >= 100) y.done++; });
  });
  const pct = (a, n) => n ? Math.round((a / n) * 10) / 10 : 0;
  section(sum, 'Key figures', 5);
  const kl = sum.addRow(['Overall progress', 'Total units', 'Completed', 'In progress', 'Not started']);
  kl.eachCell(c => { c.font = { size: 9, bold: true, color: { argb: SLATE } }; c.alignment = { horizontal: 'center' }; c.fill = fill(LIGHT); c.border = { top: thin, left: thin, right: thin }; });
  const kv = sum.addRow([pct(tp, tn) / 100, data.length, units.done, units.prog, units.none]); kv.height = 34;
  const kc = ['FF0B3D6B', 'FF0F172A', 'FF065F46', 'FF1E3A8A', 'FF991B1B'];
  kv.eachCell((c, i) => { c.font = { bold: true, size: 20, color: { argb: kc[i - 1] } }; c.alignment = { horizontal: 'center', vertical: 'middle' }; c.fill = fill(LIGHT); c.border = { bottom: thin, left: thin, right: thin }; });
  kv.getCell(1).numFmt = '0.0%';
  sum.addRow([]);
  section(sum, 'Progress by building', 5);
  header(sum.addRow(['Building', 'Units', 'Progress', 'Bar', '']));
  Object.entries(byB).forEach(([k, v], i) => { const p = pct(v.tp, v.tn); const r = sum.addRow([k, v.n, p / 100, bar(p)]); r.getCell(3).numFmt = '0.0%'; r.getCell(4).font = { color: { argb: BLUE } }; r.getCell(2).alignment = r.getCell(3).alignment = { horizontal: 'center' }; zebra(r, i); });
  sum.addRow([]);
  section(sum, 'Progress by system', 5);
  header(sum.addRow(['System', 'Progress', 'Bar', 'Units completed', 'Units']));
  systems.forEach((sys, i) => { const v = bySys[sys] || { tp: 0, tn: 0, done: 0 }; const p = pct(v.tp, v.tn); const r = sum.addRow([sys, p / 100, bar(p), v.done, v.tn]); r.getCell(2).numFmt = '0.0%'; r.getCell(3).font = { color: { argb: BLUE } }; [2, 4, 5].forEach(n => r.getCell(n).alignment = { horizontal: 'center' }); zebra(r, i); });
  footer(sum);

  // 2) Progress matrix
  const cols = ['Unit', 'Building', 'Floor', ...systems, 'Average'];
  const mx = wb.addWorksheet('Progress by unit', { views: [{ state: 'frozen', xSplit: 3, ySplit: 6, showGridLines: false }] });
  mx.columns = cols.map((_, i) => ({ width: i < 3 ? 13 : 14 }));
  banner(mx, 'PROGRESS BY UNIT AND SYSTEM', cols.length);
  header(mx.addRow(cols));
  data.slice().sort((a, b) => String(a.building).localeCompare(String(b.building)) || String(a.apt).localeCompare(String(b.apt), undefined, { numeric: true })).forEach((u, k) => {
    const vals = systems.map(sys => (u.systems && u.systems[sys]) ? (Number(u.systems[sys].progress) || 0) : null);
    const have = vals.filter(v => v != null); const avg = have.length ? have.reduce((a, v) => a + v, 0) / have.length : 0;
    const r = mx.addRow([u.apt, u.building, u.floor, ...vals.map(v => v == null ? '—' : v / 100), avg / 100]);
    r.eachCell((c, i) => {
      c.border = border; c.alignment = { horizontal: 'center', vertical: 'middle' };
      if (i <= 3) { c.fill = fill(k % 2 ? ZEBRA : WHITE); if (i === 1) c.font = { bold: true }; }
      if (i > 3 && typeof c.value === 'number') { const p = c.value * 100; c.numFmt = '0%'; c.fill = fill(fillFor(p)); c.font = { color: { argb: fontFor(p) }, bold: i === cols.length }; }
      if (i > 3 && c.value === '—') { c.font = { color: { argb: 'FF94A3B8' } }; c.fill = fill(k % 2 ? ZEBRA : WHITE); }
    });
  });
  mx.autoFilter = { from: { row: 6, column: 1 }, to: { row: 6, column: cols.length } };
  footer(mx);

  // 3) Detail
  const dcols = ['Unit', 'Building', 'Floor', 'System', 'Progress', 'Status', 'Photos', 'Last update', 'Updated by'];
  const dt = wb.addWorksheet('Detail', { views: [{ state: 'frozen', ySplit: 6, showGridLines: false }] });
  dt.columns = [{ width: 11 }, { width: 14 }, { width: 11 }, { width: 26 }, { width: 11 }, { width: 14 }, { width: 9 }, { width: 22 }, { width: 20 }];
  banner(dt, 'DETAIL BY UNIT AND SYSTEM', dcols.length);
  header(dt.addRow(dcols));
  let k = 0;
  data.forEach(u => Object.entries(u.systems || {}).forEach(([sys, x]) => {
    const ev = x.events || []; const last = ev.length ? ev[ev.length - 1] : null; const p = Number(x.progress) || 0;
    const r = dt.addRow([u.apt, u.building, u.floor, sys, p / 100, statusOf(p), Number(x.photos) || 0, last ? new Date(last.timestamp) : null, last && last.by ? last.by : '']);
    zebra(r, k++);
    r.getCell(5).numFmt = '0%'; r.getCell(8).numFmt = 'mmm d, yyyy h:mm AM/PM';
    [1, 3, 5, 6, 7].forEach(n => r.getCell(n).alignment = { horizontal: 'center' });
    r.getCell(6).font = { bold: true, color: { argb: fontFor(p) } }; r.getCell(6).fill = fill(fillFor(p));
  }));
  dt.autoFilter = { from: { row: 6, column: 1 }, to: { row: 6, column: dcols.length } };
  footer(dt);
  return wb;
}


function buildIssuesWorkbook(ExcelJS, o) {
  const { project, address, issues, logo, today, filterText } = o;
  const wb = new ExcelJS.Workbook(); wb.creator = 'Aireko QA/QC';
  const NAVY = 'FF0B3D6B', BLUE = 'FF1D4ED8', SLATE = 'FF475569', LIGHT = 'FFF8FAFC', ZEBRA = 'FFF1F5F9', WHITE = 'FFFFFFFF', LINE = 'FFE2E8F0';
  const thin = { style: 'thin', color: { argb: LINE } }, border = { top: thin, left: thin, bottom: thin, right: thin };
  const fill = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  const dateTxt = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const logoId = logo ? wb.addImage({ base64: logo, extension: 'png' }) : null;
  const banner = (ws, subtitle, cols) => {
    for (const r of [1, 2, 3]) ws.getRow(r).height = r === 1 ? 30 : 18;
    if (logoId != null) ws.addImage(logoId, { tl: { col: 0.15, row: 0.25 }, ext: { width: 120, height: 46 } });
    ws.mergeCells(1, 3, 1, cols); const t = ws.getCell(1, 3); t.value = project; t.font = { bold: true, size: 18, color: { argb: NAVY } }; t.alignment = { horizontal: 'right', vertical: 'middle' };
    ws.mergeCells(2, 3, 2, cols); const s = ws.getCell(2, 3); s.value = subtitle; s.font = { bold: true, size: 11, color: { argb: BLUE } }; s.alignment = { horizontal: 'right' };
    ws.mergeCells(3, 3, 3, cols); const a = ws.getCell(3, 3); a.value = `${address ? address + '  ·  ' : ''}${dateTxt}`; a.font = { size: 10, color: { argb: SLATE } }; a.alignment = { horizontal: 'right' };
    ws.getRow(4).height = 6; for (let c = 1; c <= cols; c++) ws.getCell(4, c).fill = fill(NAVY);
    ws.addRow([]);
  };
  const header = row => { row.height = 30; row.eachCell(c => { c.font = { bold: true, color: { argb: WHITE } }; c.fill = fill(NAVY); c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; c.border = border; }); };
  const section = (ws, text, cols) => { const r = ws.addRow([text]); ws.mergeCells(r.number, 1, r.number, cols); r.getCell(1).font = { bold: true, size: 12, color: { argb: NAVY } }; r.getCell(1).border = { bottom: { style: 'medium', color: { argb: BLUE } } }; r.height = 22; };
  const footer = (ws, rows) => { ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: rows, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.25 } };
    ws.headerFooter = { oddFooter: `&L&8Aireko Energy Group · Confidential – for project use only&C&8${project}&R&8Page &P of &N` }; };
  const d = v => v ? new Date(v) : null;
  const days = i => Math.max(0, Math.floor(((i.status === 'resolved' && i.resolved_at ? new Date(i.resolved_at) : today) - new Date(i.created_at)) / 86400000));
  const open = issues.filter(i => i.status !== 'resolved'), res = issues.filter(i => i.status === 'resolved');

  // Summary
  const sum = wb.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  sum.columns = [{ width: 30 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 18 }];
  banner(sum, 'FIELD ISSUES REPORT', 5);
  if (filterText) { const r = sum.addRow(['Filter', filterText]); sum.mergeCells(r.number, 2, r.number, 5); r.getCell(1).font = { bold: true, color: { argb: SLATE } }; sum.addRow([]); }
  section(sum, 'Key figures', 5);
  const avgOpen = open.length ? Math.round(open.reduce((a, i) => a + days(i), 0) / open.length) : 0;
  const kl = sum.addRow(['Total issues', 'Open', 'Resolved', 'Avg. days open', 'Oldest open (days)']);
  kl.eachCell(c => { c.font = { size: 9, bold: true, color: { argb: SLATE } }; c.alignment = { horizontal: 'center' }; c.fill = fill(LIGHT); c.border = { top: thin, left: thin, right: thin }; });
  const kv = sum.addRow([issues.length, open.length, res.length, avgOpen, open.length ? Math.max(...open.map(days)) : 0]); kv.height = 34;
  const kc = ['FF0F172A', 'FFB45309', 'FF065F46', 'FF1E3A8A', 'FF991B1B'];
  kv.eachCell((c, i) => { c.font = { bold: true, size: 20, color: { argb: kc[i - 1] } }; c.alignment = { horizontal: 'center', vertical: 'middle' }; c.fill = fill(LIGHT); c.border = { bottom: thin, left: thin, right: thin }; });
  const group = (title, key) => {
    sum.addRow([]); section(sum, title, 5); header(sum.addRow([title.replace('By t','T').replace('By b','B'), 'Total', 'Open', 'Resolved', '% resolved']));
    const g = {}; issues.forEach(i => { const k = i[key] || '—'; const x = g[k] = g[k] || { t: 0, o: 0, r: 0 }; x.t++; i.status === 'resolved' ? x.r++ : x.o++; });
    Object.entries(g).sort((a, b) => b[1].o - a[1].o).forEach(([k, x], n) => { const r = sum.addRow([k, x.t, x.o, x.r, x.t ? x.r / x.t : 0]); r.getCell(5).numFmt = '0%';
      r.eachCell((c, ci) => { c.border = border; c.fill = fill(n % 2 ? ZEBRA : WHITE); if (ci > 1) c.alignment = { horizontal: 'center' }; }); if (x.o) r.getCell(3).font = { bold: true, color: { argb: 'FFB45309' } }; });
  };
  group('By type', 'issue_type'); group('By building', 'building');
  footer(sum);

  // Issues list
  const maxPh = Math.max(1, ...issues.map(i => (i.photos || []).length)), maxPr = Math.max(0, ...issues.map(i => (i.resolution_photos || []).length));
  const cols = ['#', 'Unit', 'Building', 'Floor', 'Type', 'Description', 'Status', 'Days open', 'Reported by', 'Reported', 'Photos', 'Resolved by', 'Resolved', 'Resolution note', 'Proof'];
  const ws = wb.addWorksheet('Issues', { views: [{ state: 'frozen', ySplit: 6, xSplit: 2, showGridLines: false }] });
  ws.columns = [6, 10, 13, 10, 18, 42, 12, 10, 18, 18, 18, 18, 18, 36, 18].map(w => ({ width: w }));
  banner(ws, 'FIELD ISSUES — DETAIL', cols.length);
  header(ws.addRow(cols));
  issues.slice().sort((a, b) => (a.status === 'resolved') - (b.status === 'resolved') || new Date(a.created_at) - new Date(b.created_at)).forEach((i, n) => {
    const ph = i.photos || [], pr = i.resolution_photos || [];
    const r = ws.addRow([n + 1, i.apt, i.building, i.floor, i.issue_type, i.description || '', i.status === 'resolved' ? 'Resolved' : 'Pending', days(i), i.created_by_name || '', d(i.created_at), '', i.resolved_by_name || '', d(i.resolved_at), i.resolution_note || '', '']);
    r.eachCell({ includeEmpty: true }, (c, ci) => { c.border = border; c.fill = fill(n % 2 ? ZEBRA : WHITE); c.alignment = { vertical: 'top', wrapText: ci === 6 || ci === 14, horizontal: [1, 2, 4, 7, 8].includes(ci) ? 'center' : 'left' }; });
    const st = r.getCell(7); const ok = i.status === 'resolved';
    st.fill = fill(ok ? 'FFD1FAE5' : 'FFFEF3C7'); st.font = { bold: true, color: { argb: ok ? 'FF065F46' : 'FFB45309' } };
    if (!ok && days(i) >= 14) r.getCell(8).font = { bold: true, color: { argb: 'FF991B1B' } };
    r.getCell(10).numFmt = r.getCell(13).numFmt = 'mmm d, yyyy';
    const appLink = u => (typeof location !== 'undefined' && /^https?:/.test(location.origin) ? location.origin : 'https://identus-50.netlify.app') + '/?photo=' + encodeURIComponent(u);
    const link = (cell, urls0, label) => { const urls = urls0.map(appLink); if (!urls.length) return; cell.value = urls.length === 1 ? { text: `View ${label}`, hyperlink: urls[0] } : { text: `View ${label} (${urls.length})`, hyperlink: urls[0] }; cell.font = { color: { argb: BLUE }, underline: true }; if (urls.length > 1) cell.note = urls.join('\n'); };
    link(r.getCell(11), ph, 'photo'); link(r.getCell(15), pr, 'proof');
  });
  ws.autoFilter = { from: { row: 6, column: 1 }, to: { row: 6, column: cols.length } };
  footer(ws, '6:6');
  return wb;
}


async function loadExcelJS() {
  if (!window.ExcelJS) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  return window.ExcelJS;
}
let logoCache;
async function loadLogo() {
  if (logoCache !== undefined) return logoCache;
  try { const b = await (await fetch('assets/aeg-logo.png')).blob(); logoCache = await new Promise(r => { const f = new FileReader(); f.onload = () => r(String(f.result).split(',')[1]); f.readAsDataURL(b); }); }
  catch (_) { logoCache = null; }
  return logoCache;
}
async function download(wb, name) {
  const buf = await wb.xlsx.writeBuffer();
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const day = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
window.xlReport = { buildQaqcWorkbook, buildIssuesWorkbook, loadExcelJS, loadLogo, download, day };
})();
