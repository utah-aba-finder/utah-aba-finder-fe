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
  
  // Force the service worker to activate immediately
  self.skipWaiting();
});

// Fetch event - network first, minimal fallback
self.addEventListener('fetch', event => {
  // Always respond to the fetch event to prevent Safari errors
  event.respondWith(handleFetch(event));
});

async function handleFetch(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return fetch(event.request);
  }

  const url = new URL(event.request.url);

  // Handle external requests
  if (url.hostname !== location.hostname) {
    return fetch(event.request);
  }

  // For navigation requests, try network first, then cache
  if (event.request.mode === 'navigate') {
    try {
      const response = await fetch(event.request);
      // Cache successful navigation responses
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    } catch (error) {
      console.log('Service Worker: Navigation failed, serving cached index.html');
      return caches.match('/index.html');
    }
  }

  // For static assets, try cache first
  if (isStaticAsset(event.request)) {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const response = await fetch(event.request);
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    } catch (error) {
      console.error('Service Worker: Failed to fetch static asset:', error);
      // Return a basic error response if fetch fails
      return new Response('Failed to load resource', { status: 404 });
    }
  }

  // Default fetch fallback for other internal GET requests
  return fetch(event.request);
}

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
  
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
}); 