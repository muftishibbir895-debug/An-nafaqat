const CACHE = 'mess-hisab-v14';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // HTML/navigation requests: always try the network first so code updates
  // (like this Firebase/auth fix) show up immediately. Fall back to cache only if offline.
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Other static assets: cache-first (icons, manifest) is fine, they rarely change.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
