// EMERGENCY: Self-destructing service worker v2
// This service worker MUST NOT cache anything and immediately self-destructs
// Version timestamp to force update: 1762165000000

console.log('🔥 [Self-Destruct SW v2] Service worker loaded - will self-destruct');

// Install immediately, don't wait
self.addEventListener('install', function(event) {
  console.log('🔥 [Self-Destruct SW v2] Installing - skipping waiting to activate immediately');
  self.skipWaiting();
});

// Activate and take control immediately, then self-destruct
self.addEventListener('activate', function(event) {
  console.log('🔥 [Self-Destruct SW v2] Activated - taking control and self-destructing');
  event.waitUntil(
    Promise.all([
      // Clear all caches first
      caches.keys().then(function(cacheNames) {
        console.log('🔥 [Self-Destruct SW v2] Clearing ' + cacheNames.length + ' caches');
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('🔥 [Self-Destruct SW v2] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim().then(function() {
        console.log('🔥 [Self-Destruct SW v2] Claimed all clients');
        return self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      }).then(function(clients) {
        console.log('🔥 [Self-Destruct SW v2] Notifying ' + clients.length + ' clients to reload');
        // Tell all clients to reload
        clients.forEach(function(client) {
          client.postMessage({ type: 'FORCE_RELOAD', message: 'Service worker cleared - reloading' });
        });
      })
    ]).then(function() {
      // Finally, unregister this service worker
      console.log('🔥 [Self-Destruct SW v2] Unregistering self');
      return self.registration.unregister();
    }).then(function() {
      console.log('🔥 [Self-Destruct SW v2] Successfully self-destructed');
    }).catch(function(error) {
      console.error('🔥 [Self-Destruct SW v2] Error during self-destruct:', error);
    })
  );
});

// CRITICAL: Do NOT intercept ANY fetch requests
// Let everything pass through to the network
self.addEventListener('fetch', function(event) {
  // Explicitly do NOT call event.respondWith()
  // This ensures all requests go directly to the network
  console.log('🔥 [Self-Destruct SW v2] Fetch event - passing through to network:', event.request.url);
  return;
});
