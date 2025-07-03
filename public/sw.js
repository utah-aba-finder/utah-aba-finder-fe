/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'autism-services-locator-v1.0.3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip external resources that might cause certificate issues
  const url = new URL(event.request.url);
  if (url.hostname !== location.hostname && 
      !url.hostname.includes('netlify.app') && 
      !url.hostname.includes('autismserviceslocator.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request, {
      // Add cache control headers to prevent certificate caching issues
      cache: 'no-cache',
      credentials: 'same-origin'
    })
      .then(response => {
        // Only cache successful responses for static assets
        if (response.status === 200 && isCacheable(event.request)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            })
            .catch(error => {
              console.error('Failed to cache response:', error);
            });
        }
        
        return response;
      })
      .catch(error => {
        console.log('Network request failed, trying cache:', error);
        
        // Fallback to cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('Serving from cache:', event.request.url);
              return cachedResponse;
            }
            
            // If not in cache and it's a navigation request, return the cached index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return a fallback response for other requests
            return new Response('Network error', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          })
          .catch(cacheError => {
            console.error('Cache fallback failed:', cacheError);
            return new Response('Service Unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
      })
  );
});

// Helper function to determine if a request should be cached
function isCacheable(request) {
  const url = new URL(request.url);
  
  // Only cache static assets from our domain
  if (url.hostname === location.hostname && (
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
      url.pathname.includes('.woff2'))) {
    return true;
  }
  
  // Don't cache API requests or external resources
  if (url.pathname.includes('/api/') || url.hostname !== location.hostname) {
    return false;
  }
  
  return false;
}

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 