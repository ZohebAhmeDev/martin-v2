/**
 * Martin Engineering Service Worker
 * Version: martin-v1.0.0
 * Stale-while-revalidate for assets, Network-first for pages, Branded offline fallback.
 */

const CACHE_NAME = 'martin-v1.0.0';
const OFFLINE_URL = '/offline.html';

const APP_SHELL = [
  '/',
  '/index.html',
  '/aboutus.html',
  '/services.html',
  '/contactus.html',
  '/pitless.html',
  '/pittype.html',
  '/tank.html',
  '/scales.html',
  '/loadcell.html',
  '/offline.html',
  '/assets/css/style.css',
  '/assets/fonts/archivo-variable-latin.woff2',
  '/assets/js/main.js',
  '/assets/icons/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET and external third-party requests
  if (req.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // HTML Page Navigation: Network-first with cache & offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((response) => {
        if (response && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return response;
      }).catch(() => {
        return caches.match(req).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts): Cache-first with network fallback
  if (
    url.pathname.startsWith('/assets/css/') ||
    url.pathname.startsWith('/assets/fonts/') ||
    url.pathname.startsWith('/assets/js/')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return cached || fetch(req).then((response) => {
          if (response && response.status === 200) {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Images & Icons: Stale-While-Revalidate
  if (
    url.pathname.startsWith('/assets/img/') ||
    url.pathname.startsWith('/assets/icons/')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        }).catch(() => null);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default fallback
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
