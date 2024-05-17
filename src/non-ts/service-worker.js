const CACHE_NAME = 'tanda-player-cache-v1';
const urlsToCache = [
  "./app.js",
  "./bundle.js",
  "./components",
  "./components/search.element.js",
  "./components/tabs.component.js",
  "./components/tanda-element.js",
  "./components/tanda.element.js",
  "./components/track.element.js",
  "./components/virtual-scroller.component.js",
  "./css/styles.css",
  "./data-types.js",
  "./events/event-bus.js",
  "./events/events.js",
  "./ffmpeg-frame.html",
  "./icons/android-chrome-192x192.png",
  "./icons/android-chrome-512x512.png",
  "./icons/bin.png",
  "./icons/blue-pencil-edit.png",
  "./icons/blue_minus.png",
  "./icons/blue_plus.png",
  "./icons/blue_swap.png",
  "./icons/copy-move.png",
  "./icons/delete.png",
  "./icons/favicon-16x16.png",
  "./icons/favicon-32x32.png",
  "./icons/favicon.ico",
  "./icons/goBackTanda.png",
  "./icons/goBackToStart.png",
  "./icons/headphones.png",
  "./icons/headphones_white.png",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.PNG",
  "./icons/notepad.png",
  "./icons/pause.png",
  "./icons/play.png",
  "./icons/player_pause.png",
  "./icons/player_play 2.png",
  "./icons/player_play.png",
  "./icons/player_stop 2.png",
  "./icons/player_stop.png",
  "./icons/playFromStartTanda.png",
  "./icons/playLast.png",
  "./icons/playlist.PNG",
  "./icons/playNext.png",
  "./icons/playNextTanda.png",
  "./icons/red-delete-square-button-hi.png",
  "./icons/rePlay.png",
  "./icons/reset.png",
  "./icons/speaker.png",
  "./icons/speaker.svg",
  "./icons/stopNext.png",
  "./icons/stopNextTanda.png",
  "./icons/stopNow.png",
  "./icons/tap.png",
  "./icons/target.png",
  "./index.html",
  "./lib/ffmpeg.min.js",
  "./lib/howler.min.js",
  "./manifest.json",
  "./service-worker.js",
  "./services/database.js",
  "./services/ffmpeg-interface.js",
  "./services/file-database.interface.js",
  "./services/file-system.js",
  "./services/permissions.service.js",
  "./services/player.js",
  "./services/playlist-service.js",
  "./services/tanda-service.js",
  "./services/utils.js"
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
