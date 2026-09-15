// Minimal offline cache. Only registers when served over https.
const CACHE = 'sci-anim-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './core/styles.css', './core/registry.js', './core/canvas.js', './core/engine.js', './core/particles.js',
  './core/controls.js', './core/design.js', './core/quiz.js', './core/embed.js', './core/app.js',
  './topics/electrolysis.js', './topics/electrolysis.design.js'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
