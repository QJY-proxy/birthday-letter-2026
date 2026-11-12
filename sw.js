const CACHE = "xiaoliu-birthday-v14";
const CORE = [
  "./?v=14",
  "./styles.css?v=10",
  "./app.js?v=12",
  "./manifest.webmanifest?v=4",
  "./assets/icons/icon-192.png?v=1",
  "./assets/icons/icon-512.png?v=1",
  "./assets/icons/icon-maskable-512.png?v=1",
  "./assets/icons/apple-touch-icon.png?v=1",
  "./assets/fonts/baloo-2.woff2",
  "./assets/fonts/zcool-kuaile.woff2",
  "./assets/audio/letter-voice.m4a?v=1",
  "./assets/audio/xiangjianni-vocal.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.allSettled(
        CORE.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch (error) {}
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match("./?v=14")) ||
            (await caches.match(request)) ||
            new Response("这个页面需要联网加载一次。", { headers: { "Content-Type": "text/plain;charset=utf-8" } })
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
