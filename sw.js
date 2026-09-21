// Minimal offline cache. Only registers when served over https.
const CACHE = 'sci-anim-v3';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './core/styles.css', './core/registry.js', './core/canvas.js', './core/engine.js', './core/particles.js', './core/rays.js',
  './core/controls.js', './core/design.js', './core/quiz.js', './core/embed.js', './core/app.js',
  './topics/electrolysis.js', './topics/electrolysis.design.js', './topics/fuel-cell.js', './topics/reflection.js', './topics/reflection.design.js',
  './dist/electrolysis-student.html', './dist/fuel-cell-student.html', './dist/reflection-student.html'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Network first (bypassing the HTTP cache, so a new push shows on the next reload); the cache is only the offline fallback.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
