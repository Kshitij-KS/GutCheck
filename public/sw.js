/* GutCheck service worker
 * Strategy:
 *  - /api/*            → network only (never cached; privacy + correctness)
 *  - navigations       → network-first, fall back to cached page, then cached "/"
 *  - static assets     → stale-while-revalidate (cache-first with background refresh)
 *  - non-GET / cross-origin → passthrough
 * After first online use, the visited shell + assets are cached, so an installed
 * PWA opens and works offline.
 */

const VERSION = 'v2';
const CACHE = `gutcheck-${VERSION}`;
const PRECACHE_URLS = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Best-effort precache — don't fail install if one asset is missing.
      await Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Allow the page to trigger immediate activation of a waiting SW.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function isCacheableResponse(res) {
  return res && res.status === 200 && res.type === 'basic';
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never cache API traffic.
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network-first with cache fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (isCacheableResponse(fresh)) {
            const cache = await caches.open(CACHE);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(request)) || (await cache.match('/')) || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets & other GETs: stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (isCacheableResponse(res)) cache.put(request, res.clone());
          return res;
        })
        .catch(() => null);
      return cached || (await network) || Response.error();
    })()
  );
});
