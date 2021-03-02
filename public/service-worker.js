const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/indexedDB.js',
    '/index.js',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.webmanifest',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
];

const CACHE_NAME = 'static-cache-v13';
const DATA_CACHE_NAME = 'data-cache-v8';

//Install service worker
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 5. Fetch Files
self.addEventListener('fetch', evt => {
    if (evt.request.url.includes('/api/')) {
        console.log('[Service Worker] Fetch (data)', evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(evt.request);
                    });
            })
        );

        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request)
            });

        })
    );
});


// const PRECACHE = 'precache-v1';
// const RUNTIME = 'runtime';

// self.addEventListener('install', (event) => {
//     event.waitUntil(
//         caches
//         .open(PRECACHE)
//         .then((cache) => cache.addAll(FILES_TO_CACHE))
//         .then(self.skipWaiting())
//     );
// });

// // The activate handler takes care of cleaning up old caches.
// self.addEventListener('activate', (event) => {
//     const currentCaches = [PRECACHE, RUNTIME];
//     event.waitUntil(
//         caches
//         .keys()
//         .then((cacheNames) => {
//             return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
//         })
//         .then((cachesToDelete) => {
//             return Promise.all(
//                 cachesToDelete.map((cacheToDelete) => {
//                     return caches.delete(cacheToDelete);
//                 })
//             );
//         })
//         .then(() => self.clients.claim())
//     );
// });

// self.addEventListener('fetch', (event) => {
//     if (event.request.url.startsWith(self.location.origin)) {
//         event.respondWith(
//             caches.match(event.request).then((cachedResponse) => {
//                 if (cachedResponse) {
//                     return cachedResponse;
//                 }

//                 return caches.open(RUNTIME).then((cache) => {
//                     return fetch(event.request).then((response) => {
//                         return cache.put(event.request, response.clone()).then(() => {
//                             return response;
//                         });
//                     });
//                 });
//             })
//         );
//     }
// });