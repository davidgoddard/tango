const CACHE_NAME = 'tanda-player-cache-v1';
const urlsToCache = [
  './index.html',
  './child.html',
  './css/styles.css',
  './bundle.js',
  './components/tanda.element.js',
  './components/search.element.js',
  './components/tabs-element.js',
  './components/cortina.element.js',
  './components/virtual-scroller.component.js',
  './components/search-element.js',
  './components/search.component.js',
  './components/track.element.js',
  './components/tanda-element.js',
  './components/tabs.element.js',
  './components/tabs.component.js',
  './icons/favicon-16x16.png',
  './icons/icon-192x192.png',
  './icons/rePlay.png',
  './icons/headphones.png',
  './icons/notepad.png',
  './icons/player_play.png',
  './icons/red-delete-square-button-hi.png',
  './icons/playlist.PNG',
  './icons/favicon.ico',
  './icons/android-chrome-192x192.png',
  './icons/copy-move.png',
  './icons/player_play 2.png',
  './icons/blue_swap.png',
  './icons/tap.png',
  './icons/playNextTanda.png',
  './icons/headphones-icon.png',
  './icons/reset.png',
  './icons/target.png',
  './icons/goBackToStart.png',
  './icons/stopNext.png',
  './icons/stopNow.png',
  './icons/android-chrome-512x512.png',
  './icons/speaker.svg',
  './icons/pause.png',
  './icons/stopNextTanda.png',
  './icons/playNext.png',
  './icons/icon-512x512.PNG',
  './icons/bin.png',
  './icons/delete.png',
  './icons/headphones_white.png',
  './icons/speaker-icon.jpg',
  './icons/blue_plus.png',
  './icons/blue-pencil-edit.png',
  './icons/blue_minus.png',
  './icons/player_pause.png',
  './icons/playLast.png',
  './icons/speaker.png',
  './icons/play.png',
  './icons/player_stop.png',
  './icons/goBackTanda.png',
  './icons/favicon-32x32.png',
  './icons/playFromStartTanda.png',
  './icons/player_stop 2.png',
  './data-types.js',
  './manifest.json',
  './lib/ffmpeg.min.js',
  './lib/howler.min.js',
  './service-worker.js',
  './events/events.js',
  './events/event-bus.js',
  './app.js',
  './services/database.js',
  './services/ffmpeg-interface.js',
  './services/file-system.js',
  './services/player.js',
  './services/utils.js',
  './services/playlist-service.js',
  './services/tanda-service.js',
  './ffmpeg-frame.html'
];

self.addEventListener('install', event => {
  try {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .catch(error => {
          console.error(error)
        })
    );
  } catch (error) {
    console.error(error)
    throw error;
  }
});

self.addEventListener('fetch', event => {
  try {
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
  } catch (error) {
    console.error(error)
    throw error;
  }

});
