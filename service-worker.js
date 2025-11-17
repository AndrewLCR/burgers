const CACHE_NAME = "burgers-cache-v3"; // súbelo para forzar refresh
const ASSETS = [
  "/Burgers/",
  "/Burgers/Calc.html",
  "/Burgers/manifest.webmanifest",
  "/Burgers/icon-192.png",
  "/Burgers/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.url.includes("script.google.com/macros")) {
    return; // No tocar requests al backend
  }

  // Cache-first para assets
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            if (req.method === "GET" && res && res.status === 200) {
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(req, res.clone()));
            }
            return res;
          })
          .catch(() => cached)
    )
  );
});
