const CACHE_NAME = 'gakuka-study-v7';
const APP_BASE = self.registration.scope;
const APP_INDEX = new URL('index.html', APP_BASE).href;
const APP_FILES = [
  './', 'index.html', 'style.css', 'app.js', 'special-data.js', 'number-data.js', 'answer-explanations.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  ...Array.from({length: 4}, (_, i) => Array.from({length: 6}, (_, j) => `signs/tok${i + 1}-${j + 1}.jpg`)).flat(),
  ...Array.from({length: 5}, (_, i) => [6,14,22,30,42,50,58,66,72,80].map(n => `signs/num${i + 1}-q${n}.jpg`)).flat(),
  ...Array.from({length: 5}, (_, i) => `explanations/No${i + 1}.jpg`),
  ...Array.from({length: 4}, (_, i) => `explanations/Toku${i + 1}.jpg`),
  ...Array.from({length: 5}, (_, i) => Array.from({length: 5}, (_, j) => `No${i + 1}-${91 + j}.jpg`)).flat()
].map(path => new URL(path, APP_BASE).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('gakuka-study-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(APP_INDEX, copy));
      return response;
    }).catch(() => caches.match(APP_INDEX)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
