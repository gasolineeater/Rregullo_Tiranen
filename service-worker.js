// Service Worker for Rregullo Tiranen PWA

const CACHE_NAME = 'rregullo-tiranen-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/report.html',
  '/html/map.html',
  '/html/report-detail.html',
  '/offline.html',
  '/css/style.css',
  '/css/report.css',
  '/css/map.css',
  '/css/report-detail.css',
  '/css/mobile.css',
  '/js/main.js',
  '/js/report.js',
  '/js/map.js',
  '/js/report-detail.js',
  '/js/data-store.js',
  '/js/auth-store.js',
  '/js/api-service.js',
  '/js/pwa.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...', event);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Successfully cached app shell');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Cache error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...', event);

  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );

  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('fonts.googleapis.com') &&
      !event.request.url.includes('unpkg.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }

        console.log('[Service Worker] Fetching resource:', event.request.url);
        return fetch(event.request)
          .then(fetchResponse => {
            // Don't cache API calls or dynamic content
            if (!event.request.url.includes('/api/') &&
                event.request.method === 'GET') {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('[Service Worker] Caching new resource:', event.request.url);
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
            }
            return fetchResponse;
          });
      })
      .catch(error => {
        console.error('[Service Worker] Fetch error:', error);
        // Return the offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        // Return empty response for other requests
        return new Response('', { status: 408, statusText: 'Request timed out' });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  // Verify the origin of the message
  const validOrigins = [
    self.location.origin,
    'https://rregullo-tiranen.al' // Add your production domain when deployed
  ];

  if (validOrigins.includes(event.origin) && event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background Sync event triggered', event);

  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

// Function to sync reports when back online
function syncReports() {
  // This would normally send data to a server
  // For now, we'll just log that sync would happen
  console.log('[Service Worker] Syncing reports...');

  // In a real implementation, you would:
  // 1. Get pending reports from IndexedDB
  // 2. Send them to the server
  // 3. Update local storage with success/failure

  return Promise.resolve();
}
