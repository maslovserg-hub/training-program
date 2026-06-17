// Service worker: кэширует приложение для офлайн-работы.
const CACHE = 'training-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.png', './athlete-kb.webp', './athlete-run.webp'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // HTML-страница: сначала сеть (всегда свежая), кэш — офлайн-запас.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Статика: сначала кэш, иначе сеть.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
