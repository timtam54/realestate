// EMERGENCY: Self-destructing service worker
// This service worker immediately unregisters itself when activated
// This fixes the OAuth redirect loop issue caused by the old service worker

console.log('🔥 [Self-Destruct SW] Service worker loaded');

// Unregister immediately when this script loads
self.addEventListener('install', function(event) {
  console.log('🔥 [Self-Destruct SW] Install event - skipping waiting');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('🔥 [Self-Destruct SW] Activate event - unregistering self');
  event.waitUntil(
    self.registration.unregister()
      .then(function() {
        console.log('🔥 [Self-Destruct SW] Successfully unregistered');
        // Clear all caches
        return caches.keys();
      })
      .then(function(cacheNames) {
        console.log('🔥 [Self-Destruct SW] Clearing ' + cacheNames.length + ' caches');
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('🔥 [Self-Destruct SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(function() {
        console.log('🔥 [Self-Destruct SW] All caches cleared');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .then(function() {
        console.log('🔥 [Self-Destruct SW] Claimed all clients');
        // Reload all clients
        return self.clients.matchAll({ type: 'window' });
      })
      .then(function(clients) {
        console.log('🔥 [Self-Destruct SW] Reloading ' + clients.length + ' clients');
        clients.forEach(function(client) {
          console.log('🔥 [Self-Destruct SW] Posting message to client:', client.url);
          client.postMessage({
            type: 'SW_UNREGISTERED',
            message: 'Service worker has been unregistered. Reloading page...'
          });
          // Force navigate to reload (this bypasses the service worker)
          client.navigate(client.url);
        });
      })
      .catch(function(error) {
        console.error('🔥 [Self-Destruct SW] Error during self-destruct:', error);
      })
  );
});

// Don't intercept any fetch requests - let them go through to the network
self.addEventListener('fetch', function(event) {
  // Do nothing - let all requests pass through to the network
  return;
});
