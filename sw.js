/**
 * Score Cekih by Sadewa Corp - High Performance PWA Service Worker
 * Fully Functional Offline Cache Data Storage Architecture Engine
 */

const CACHE_NAME = "score-cekih-v1";
const ASSETS_TO_CACHE = [
    "index.html",
    "style.css",
    "app.js",
    "manifest.json",
    "classic-192.png",
    "classic-512.png",
    "godofgambler.wav",
    "dimulaidari0.wav"
];

// Service Worker Install Lifecycle Event Node
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// Service Worker Activation Lifecycle Event Node
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Dynamic Resource Recovery Network Cache Fetch Layer Interceptor
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Fail-safe boundary layer intercept check for media data types
                if (event.request.url.indexOf(".wav") !== -1) {
                    return new Response("", { status: 404, statusText: "Offline Audio Asset Unavailable" });
                }
            });
        })
    );
});
