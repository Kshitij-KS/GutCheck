/* GutCheck minimal service worker — app shell; API routes are never cached here. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) {
    return;
  }
  event.respondWith(
    (async () => {
      if (event.request.method !== "GET") {
        return fetch(event.request);
      }
      try {
        return await fetch(event.request);
      } catch (e) {
        return Response.error();
      }
    })()
  );
});
