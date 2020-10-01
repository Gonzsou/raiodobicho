
const CACHE_NAME = 'sw-cache-example';

const toCache = [
  '/',
  '/index.html',
  '/offline.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // One important thing about the addAll operation is that it's all or nothing. If one of the files is not present or fails to be fetched, the entire addAll operation fails. A good application will handle this scenario
        return cache.addAll(toCache)
      })
      .then(self.skipWaiting())
  )
})

self.addEventListener('fetch', function(event) {
  console.log('used to intercept requests so we can check for the file or data in the cache')
  //the 'event.respondWith()' method tells the browser to evaluate the result of the event in the future.
  //Current page responds with a 200 when offline
  event.respondWith(
    // 'caches.match(event.request)' takes the current web request that triggered the fetch event and looks in the cache for a resource that matches.
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
})

self.addEventListener('activate', function(event) {
  console.log('this event triggers when the service worker activates')
})