const CACHE_NAME = 'v1';
const CACHE_URLS = [              // List of files you want to cache
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/lib/database.js',
  '/lib/file_system.js',
  '/lib/player.js',
  '/lib/howler.min.js',
  '/lib/service-worker.js',
  '/components/playlist.element.js',
  '/components/tanda.element.js',
  '/components/track.element.js',
];

// Install Event: caches files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(CACHE_URLS);
      })
  );
});

// Fetch Event: serves files from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
