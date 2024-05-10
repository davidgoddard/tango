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
  '/lib/ffmpeg-interface.js',
  '/lib/ffmpeg.min.js',
  '/lib/main.js',
  '/lib/search.js',
  '/components/playlist.element.js',
  '/components/tanda.element.js',
  '/components/track.element.js',
  '/components/cortina.element.js',
  '/components/search.element.js',
  '/components/scratch=pad.element.js',
  '/components/file.element.js',
  './icons/bin.png',
  './icons/blue_minus.png',
  './icons/blue_plus.png',
  './icons/blue_swap.png',
  './icons/blue-pencil-edit.png',
  './icons/copy-move.png',
  './icons/delete.png',
  './icons/goBackTanda.png',
  './icons/goBackToStart.png',
  './icons/headphones_white.png',
  './icons/headphones.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.PNG',
  './icons/notepad.png',
  './icons/pause.png',
  './icons/play.png',
  './icons/player_pause.png',
  './icons/player_play 2.png',
  './icons/player_play.png',
  './icons/player_stop 2.png',
  './icons/player_stop.png',
  './icons/playFromStartTanda.png',
  './icons/playLast.png',
  './icons/playlist.PNG',
  './icons/playNext.png',
  './icons/playNextTanda.png',
  './icons/red-delete-square-button-hi.png',
  './icons/rePlay.png',
  './icons/reset.png',
  './icons/stopNext.png',
  './icons/stopNextTanda.png',
  './icons/stopNow.png',
  './icons/tap.png',
  './icons/target.png'
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
