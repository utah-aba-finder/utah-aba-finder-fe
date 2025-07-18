/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'autism-services-locator-v1.0.4';

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

// Fetch event - simple network first with minimal fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip external resources
  const url = new URL(event.request.url);
  if (url.hostname !== location.hostname) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful static asset responses
        if (response.status === 200 && isStaticAsset(event.request)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            })
            .catch(error => {
              console.error('Service Worker: Failed to cache response:', error);
            });
        }
        return response;
      })
      .catch(error => {
        console.log('Service Worker: Network failed, trying cache:', error);
        
        // Simple cache fallback only for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        // For other requests, just let them fail naturally
        return fetch(event.request);
      })
  );
});

// Helper function to determine if a request is a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  // Only cache static assets from our domain
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