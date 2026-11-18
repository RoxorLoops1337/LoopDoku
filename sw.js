/* LoopDoku offline helper. Same-origin files: try the network first (so fixes show up right away), fall back to the
   saved copy after 3 seconds or when offline. Google Fonts: saved copy first. Bump VERSION to drop old saved copies. */
const VERSION = 'loopdoku-v1';
const CORE = ['./', 'index.html', 'loopdoku-core.js', 'loopdoku-levels.js', 'loopdoku-meta.js', 'manifest.webmanifest', 'thumbs/icon-192.png', 'thumbs/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const put = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; };

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(new Promise((resolve) => {
      let settled = false;
      const fromCache = () => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
      const timer = setTimeout(() => fromCache().then((hit) => { if (hit && !settled) { settled = true; resolve(hit); } }), 3000);
      fetch(req).then((res) => { put(req, res); if (!settled) { settled = true; clearTimeout(timer); resolve(res); } })
        .catch(() => fromCache().then((hit) => { if (!settled) { settled = true; clearTimeout(timer); resolve(hit || Response.error()); } }));
    }));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
  }
});
