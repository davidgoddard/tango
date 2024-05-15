const CACHE_NAME = 'tanda-player-cache-v1';
const urlsToCache = [
  './index.html',
  './css/styles.css',
  './bundle.js',
  './components/tanda.element.js',
  './components/search.element.js',
  './components/tabs-element.js',
  './components/search-element.js',
  './components/search.component.js',
  './components/track.element.js',
  './components/tanda-element.js',
  './components/tabs.element.js',
  './components/tabs.component.js',
  './icons/android-192x192.png',
  './icons/rePlay.png',
  './icons/notepad.png',
  './icons/player_play.png',
  './icons/red-delete-square-button-hi.png',
  './icons/playlist.png',
  './icons/copy-move.png',
  './icons/player_play 2.png',
  './icons/blue_swap.png',
  './icons/tap.png',
  './icons/playNextTanda.png',
  './icons/headphones.png',
  './icons/reset.png',
  './icons/target.png',
  './icons/goBackToStart.png',
  './icons/stopNext.png',
  './icons/stopNow.png',
  './icons/pause.png',
  './icons/stopNextTanda.png',
  './icons/playNext.png',
  './icons/android-512x512.png',
  './icons/bin.png',
  './icons/delete.png',
  './icons/headphones_white.png',
  './icons/speaker.png',
  './icons/blue_plus.png',
  './icons/blue-pencil-edit.png',
  './icons/blue_minus.png',
  './icons/player_pause.png',
  './icons/playLast.png',
  './icons/play.png',
  './icons/player_stop.png',
  './icons/goBackTanda.png',
  './icons/playFromStartTanda.png',
  './icons/player_stop 2.png',
  './data-types.js',
  './lib/ffmpeg.min.js',
  './lib/howler.min.js',
  './events/events.js',
  './events/event-bus.js',
  './app.js',
  './services/database.js',
  './services/ffmpeg-interface.js',
  './services/file-system.js',
  './services/player.js',
  './services/utils.js',
  './services/playlist-service.js',
  './services/tanda-service.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
