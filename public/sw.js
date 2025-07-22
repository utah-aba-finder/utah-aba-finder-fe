/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'autism-services-locator-v1.0.5';

// Install event - minimal caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache opened');
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]);
      })
      .catch(error => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
});

// Fetch event - network first, minimal fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external resources
  const url = new URL(event.request.url);
  if (url.hostname !== location.hostname) {
    return;
  }

  // For navigation requests, try network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For static assets, try cache first, then network
  if (isStaticAsset(event.request)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseClone);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // For all other requests, just pass through
  return;
});

// Helper function to determine if a request is a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  return url.hostname === location.hostname && (
    url.pathname.includes('/static/') || 
    url.pathname.includes('.js') || 
    url.pathname.includes('.css') ||
    url.pathname.includes('.png') ||
    url.pathname.includes('.jpg') ||
    url.pathname.includes('.jpeg') ||
    url.pathname.includes('.gif') ||
    url.pathname.includes('.svg') ||
    url.pathname.includes('.ico') ||
    url.pathname.includes('.woff') ||
    url.pathname.includes('.woff2')
  );
}

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 