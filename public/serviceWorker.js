// Service worker file to prevent 404 errors
// This is a minimal implementation that does nothing

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Just pass through to the network by default
  event.respondWith(fetch(event.request));
}); 