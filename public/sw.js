/* eslint-disable no-restricted-globals */

/**
 * Autism Services Locator — Service Worker
 * Strategy:
 * - HTML/documents: Network-First (fresh deploys win), fallback to /offline.html
 * - Static assets (js/css/fonts/images/workers): Stale-While-Revalidate
 * - Everything else same-origin GET: Network-First
 * - Never cache API/authed requests
 * - Mobile-safe: skipWaiting + clientsClaim
 */

const VERSION = 'asl-sw-v3-2025-08-12';
const RUNTIME_CACHE = `${VERSION}-runtime`;
const ASSETS_CACHE  = `${VERSION}-assets`;
const HTML_CACHE    = `${VERSION}-html`;
const OFFLINE_URL   = '/offline.html';

// Toggle verbose logs by setting true during debugging
const DEBUG = true;

// Simple logger
const log = (...args) => DEBUG && console.log('[SW]', ...args);

// Utility: is same-origin GET
const isSameOriginGet = (req) =>
  req.method === 'GET' && new URL(req.url).origin === self.location.origin;

// Utility: request has auth header or query—don't cache
const isAuthed = (req) =>
  req.headers.has('Authorization') || /[?&]token=/.test(new URL(req.url).search);

// Utility: treat as "document"/navigation
const isNavigation = (event) =>
  event.request.mode === 'navigate' ||
  (event.request.destination === 'document');

// Install: precache only offline page to keep things simple & robust
self.addEventListener('install', (event) => {
  log('Installing…', VERSION);
  event.waitUntil(
    caches.open(HTML_CACHE).then(async (cache) => {
      try {
        // Bypass HTTP caching to ensure the latest offline page is stored
        const resp = await fetch(OFFLINE_URL, { cache: 'no-store' });
        if (resp.ok) await cache.put(OFFLINE_URL, resp.clone());
      } catch (e) {
        log('offline.html fetch failed (will still activate):', e);
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: claim clients + clean old caches
self.addEventListener('activate', (event) => {
  log('Activating…', VERSION);
  event.waitUntil((async () => {
    // Remove old versions
    const keys = await caches.keys();
    await Promise.all(
      keys.map((k) => {
        if (!k.startsWith(VERSION)) {
          log('Deleting old cache:', k);
          return caches.delete(k);
        }
      })
    );
    await self.clients.claim();
  })());
});

// Fetch: always return a Response (never null)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Debug logging (only in development)
  if (DEBUG) {
    log('Fetch event:', {
      url: request.url,
      method: request.method,
      mode: request.mode,
      destination: request.destination,
      origin: url.origin,
      isSameOrigin: url.origin === self.location.origin,
      pathname: url.pathname
    });
  }

  // Always ignore cross-origin requests completely
  if (url.origin !== self.location.origin) {
    if (DEBUG) log('Ignoring cross-origin request:', url.origin);
    return;
  }

  // Only handle same-origin GET requests
  if (!isSameOriginGet(request)) {
    if (DEBUG) log('Ignoring non-GET or non-same-origin request');
    return;
  }

  // Never cache API calls or authed requests
  const isApi = url.pathname.startsWith('/api/');
  if (isApi || isAuthed(request)) {
    if (DEBUG) log('Ignoring API or authed request:', url.pathname);
    return;
  }

  // Documents (HTML) — Network-First, fallback offline.html
  if (isNavigation(event) || request.destination === 'document') {
    if (DEBUG) log('Handling navigation request');
    event.respondWith(networkFirstForHTML(request));
    return;
  }

  // Static assets — Stale-While-Revalidate
  if (['style', 'script', 'font', 'image', 'worker'].includes(request.destination)) {
    if (DEBUG) log('Handling static asset request:', request.destination);
    event.respondWith(staleWhileRevalidate(request, ASSETS_CACHE));
    return;
  }

  // Other same-origin GET — Network-First (safe default)
  if (DEBUG) log('Handling generic GET request');
  event.respondWith(networkFirstGeneric(request, RUNTIME_CACHE));
});

// Message channel: allow page to request immediate activation / clear caches
self.addEventListener('message', async (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') {
    log('Received SKIP_WAITING');
    await self.skipWaiting();
  } else if (type === 'CLEAR_CACHES') {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    log('All caches cleared by message');
  }
});

/* ---------------- Strategies ---------------- */

async function networkFirstForHTML(request) {
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    if (fresh && fresh.ok) {
      const cache = await caches.open(HTML_CACHE);
      cache.put(request, fresh.clone());
      return fresh;
    }
    // fetch returned non-ok; fall back
    const cached = await caches.match(request);
    return cached || (await caches.match(OFFLINE_URL)) || new Response('', { status: 503 });
  } catch (err) {
    // offline or network error
    const cached = await caches.match(request);
    return cached || (await caches.match(OFFLINE_URL)) || new Response('', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = (async () => {
    try {
      const resp = await fetch(request);
      if (resp && resp.ok) {
        cache.put(request, resp.clone());
      }
      return resp;
    } catch (e) {
      return null; // we'll rely on cached if available
    }
  })();

  // Return cached immediately if present, else await network
  const networkResp = await Promise.race([networkPromise, Promise.resolve(null)]);
  return cached || networkResp || (await networkPromise) || Response.error();
}

async function networkFirstGeneric(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
      return fresh;
    }
    const cached = await cache.match(request);
    return cached || new Response('', { status: 503 });
  } catch (e) {
    const cached = await cache.match(request);
    return cached || new Response('', { status: 503 });
  }
} 