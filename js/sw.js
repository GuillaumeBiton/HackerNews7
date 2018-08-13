const VERSION = 'v1';
var urlsToCache = [
  '/',
  '/css/hn7.css',
  '/css/icons.js',
  '/js/hn7.js',
  'js/routes.js',
  '/pages'
];

self.addEventListener('install', function(event) {
  
  // Perform install steps
  event.waitUntil(
    caches.open(VERSION)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});