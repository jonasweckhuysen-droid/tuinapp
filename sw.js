const CACHE_NAME = "tuinapp-cache-v1";
const ASSETS_TO_CACHE = [
  "index.html",
  "style.css",
  "script.js",
  "images/logo-192.png",
  "images/logo-512.png"
];

// Install event – cache alle assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((path) => {
          return cache.add(new Request(path, { mode: "no-cors" }));
        })
      );
    })
  );
});

// Fetch event – serve cache first
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Activate event – oude caches verwijderen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});
