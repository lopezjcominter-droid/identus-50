const CACHE = 'identus-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.pathname.startsWith('/.netlify/')) return;
  const nav = r.mode === 'navigate';
  const cdn = /(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.host);
  if (!(nav || u.origin === self.location.origin || cdn)) return;
  const key = nav ? '/' : r;
  e.respondWith(
    fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(key, cp)); }
      return res;
    }).catch(() => caches.match(key).then(m => m || Response.error()))
  );
});
