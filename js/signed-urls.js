// Private photos: every link to the identus-files bucket is turned into a
// short-lived signed link for the signed-in user. Works for <img>, new Image(),
// links, fetch() and window.open, so the modules keep their stored URLs as-is.
// While the bucket is still public, a failed signature falls back to the old link.
(function () {
  const BUCKET = 'identus-files';
  const RE = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/identus-files\/([^?#]+)/;
  const TTL = 3600, KEEP = 50 * 60 * 1000;
  const cache = new Map(); let queue = new Map(), timer = null;
  const pathOf = u => { if (typeof u !== 'string' || u.startsWith('data:') || u.startsWith('blob:')) return null; const m = u.match(RE); if (!m) return null; try { return decodeURIComponent(m[1]); } catch (_) { return m[1]; } };
  const client = () => { try { return typeof sbClient !== 'undefined' ? sbClient : null; } catch (_) { return null; } };
  const hit = p => { const c = cache.get(p); return c && c.exp > Date.now() && c.url ? c.url : null; };
  const failed = p => { const c = cache.get(p); return !!(c && c.exp > Date.now() && c.fail); };
  function flush() {
    timer = null; const batch = queue; queue = new Map();
    const paths = [...batch.keys()], c = client();
    const done = (list) => list.forEach(p => (batch.get(p) || []).forEach(w => w(hit(p))));
    if (!c || !c.storage) return done(paths);
    for (let i = 0; i < paths.length; i += 100) {
      const chunk = paths.slice(i, i + 100);
      c.storage.from(BUCKET).createSignedUrls(chunk, TTL).then(({ data }) => {
        (data || []).forEach(d => { if (d && d.signedUrl && d.path) cache.set(d.path, { url: d.signedUrl, exp: Date.now() + KEEP }); });
        chunk.forEach(p => { if (!hit(p)) cache.set(p, { fail: true, exp: Date.now() + 5 * 60 * 1000 }); });
        done(chunk);
      }).catch(() => { chunk.forEach(p => cache.set(p, { fail: true, exp: Date.now() + 60 * 1000 })); done(chunk); });
    }
  }
  function sign(url) {
    const p = pathOf(String(url || '')); if (!p) return Promise.resolve(url);
    const h = hit(p); if (h) return Promise.resolve(h); if (failed(p)) return Promise.resolve(url);
    return new Promise(res => { if (!queue.has(p)) queue.set(p, []); queue.get(p).push(s => res(s || url)); if (!timer) timer = setTimeout(flush, 15); });
  }
  const signSync = url => { const p = pathOf(String(url || '')); return p ? hit(p) : null; };
  window.sbSign = sign; window.sbSignSync = signSync; window.sbIsStorageUrl = u => !!pathOf(String(u || ''));

  // new Image().src = url / img.src = url
  const ds = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, enumerable: ds.enumerable,
    get() { return this.__sbWant && !ds.get.call(this) ? this.__sbWant : ds.get.call(this); },
    set(v) {
      const s = String(v); if (!pathOf(s)) { this.__sbWant = null; return ds.set.call(this, v); }
      const now = signSync(s) || (failed(pathOf(s)) ? s : null); if (now) { this.__sbWant = null; this.__sbFinal = now; return ds.set.call(this, now); }
      this.__sbWant = s; sign(s).then(u => { if (this.__sbWant === s) { this.__sbWant = null; this.__sbFinal = u; ds.set.call(this, u); } });
    }
  });
  // <img src> / <a href> written as HTML
  const fixEl = el => {
    if (el.tagName === 'IMG') { const v = el.getAttribute('src'); if (v && v !== el.__sbFinal && v !== el.__sbWant && pathOf(v) && !/\/object\/sign\//.test(v)) el.src = v; }
    else if (el.tagName === 'A') { const v = el.getAttribute('href'); if (v && v !== el.__sbFinal && pathOf(v) && !/\/object\/sign\//.test(v)) { el.__sbFinal = v; sign(v).then(u => { if (el.getAttribute('href') === v) { el.__sbFinal = u; el.setAttribute('href', u); } }); } }
  };
  const scan = root => { if (root.nodeType !== 1) return; if (root.tagName === 'IMG' || root.tagName === 'A') fixEl(root); root.querySelectorAll && root.querySelectorAll('img[src*="identus-files"],a[href*="identus-files"]').forEach(fixEl); };
  new MutationObserver(ms => ms.forEach(m => { if (m.type === 'attributes') fixEl(m.target); else m.addedNodes.forEach(scan); }))
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'href'] });
  // fetch(url)
  const of = window.fetch.bind(window);
  window.fetch = (input, init) => { const u = typeof input === 'string' ? input : (input && input.url); return pathOf(u || '') && !/\/object\/sign\//.test(u) ? sign(u).then(s => of(s, init)) : of(input, init); };
  // window.open(url)
  const oo = window.open.bind(window);
  window.open = (url, ...rest) => {
    if (!pathOf(String(url || '')) || /\/object\/sign\//.test(url)) return oo(url, ...rest);
    const now = signSync(url); if (now) return oo(now, ...rest);
    const w = oo('', ...rest); sign(url).then(u => { if (w) w.location.href = u; else oo(u, ...rest); }); return w;
  };
})();
