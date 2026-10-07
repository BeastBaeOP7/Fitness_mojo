const CACHE_NAME = 'fit-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './styles/main.css',
  './js/config.js',
  './js/state.js',
  './js/firebase-service.js',
  './js/health-service.js',
  './js/app.js',
  './js/components/dashboard.js',
  './js/components/nutrition.js',
  './js/components/workout.js',
  './js/components/progress.js',
  './js/components/settings.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching core offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // Network first strategy with offline fallback
  evt.respondWith(
    fetch(evt.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && evt.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evt.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(evt.request);
      })
  );
});
