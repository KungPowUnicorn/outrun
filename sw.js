/* OutRun Delivery service worker: caches the game so it runs with no connection (e.g. airplane mode). */
const VERSION = 'outrun-v1';
const ESSENTIAL = ['./', 'index.html', 'styles.css', 'game.js'];
const OPTIONAL = ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(ESSENTIAL);                                   // install fails (and retries) if the game itself can't be cached
    await Promise.all(OPTIONAL.map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (same || FONT_HOSTS.includes(url.hostname)) e.respondWith(handle(e, req, same && req.mode === 'navigate'));
});

// Serve from cache instantly, refresh the cache in the background, fall back to the cached page if offline.
async function handle(e, req, isNav) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(req, { ignoreSearch: isNav });
  const refresh = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  if (cached) { e.waitUntil(refresh); return cached; }
  const res = await refresh;
  if (res) return res;
  if (isNav) { const page = await cache.match('index.html'); if (page) return page; }
  return new Response('Offline', { status: 503, statusText: 'Offline' });
}
