const CACHE_NAME = 'bodasync-cache-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  if (request.headers.has('range')) {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (
    request.destination === 'audio' ||
    request.destination === 'video'
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseCopy = response.clone();

        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, responseCopy))
          .catch(() => {
            // El contenido seguirá funcionando aunque no pueda almacenarse.
          });

        return response;
      })
      .catch(() => caches.match(request))
  );
});