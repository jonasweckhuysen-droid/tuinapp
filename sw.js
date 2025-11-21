const CACHE_NAME = "tuinapp-cache-v1";
const ASSETS_TO_CACHE = [
    "/",
    "index.html",
    "style.css",
    "script.js",
    "images/logo-192.png",
    "images/logo-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
        )
    );
});
