importScripts('js/serviceworker-cache-polyfill.js');

var pathComp = self.location.pathname.split("/");
var pathPrefix = pathComp.slice(0, pathComp.length - 1).join('/') + '/';
// The files we want to cache
var CACHE_CORE = 'quizzr-core';
var CACHE_DATA = 'quizzr-data';
var CACHE_PICS = 'quizzr-pics';
var urlsToCache = [
  pathPrefix,
  pathPrefix + 'css/quizzr.min.css',
  pathPrefix + 'js/quizzr.min.js',
  pathPrefix + 'images/question.svg',
  pathPrefix + 'images/cloud-download.svg',
];

// Set the callback for the install step
self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
      caches.open(CACHE_CORE)
        .then(function(cache) {
          return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        var fetchRequest = event.request.clone();

        return fetch(fetchRequest, {mode: 'no-cors'}).then(
          function(response) {
            // Check if we received a valid response
            if(!response || (response.status !== 200 && response.status !== 0)) {
              return response;
            }

            var responseToCache = response.clone();
            var targetCache = CACHE_CORE;

            if (response.headers.has('content-type')) {
                if (response.headers.get('content-type').match(/application\/json/i)) {
                  // JSON data gets cached in data cache
                  targetCache = CACHE_DATA;
                } else if (response.headers.get('content-type').match(/^image\//i)) {
                  // images responses get cached in pics cache
                  targetCache = CACHE_PICS;
                }
            } else if (response.status === 0) {
                // opaque responses get cached in pics cache
                targetCache = CACHE_PICS;
            }
            caches.open(targetCache)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(console.error.bind(console));
      })
    );
});

self.addEventListener('message', function(event) {
  switch(event.data.command) {
    case 'gotpics':
      caches.open(CACHE_PICS)
        .then(function(cache) {  return cache.keys();})
        .then(function(reqs) {
           event.ports[0].postMessage( reqs.map(function(r) { return r.url;}));
         });
    break;
    case 'downloadpics':
      var pics = event.data.urls || [];
      var init = {method: 'GET', mode:'no-cors'};
      pics.forEach(function (p) {
        var r = new Request(p, init);
        fetch(r).then(
          function(response) {
            caches.open(CACHE_PICS)
             .then(function(cache) {
                return cache.put(r, response)
                  .then(function() {
                    return cache.keys()
                  })
             }).then(function (reqs) {
                event.ports[0].postMessage( reqs.map(function(r) { return r.url;}));
             }).catch(console.error.bind(console));
        });
      });
      break;
  }
});
