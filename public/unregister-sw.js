// EMERGENCY SERVICE WORKER KILL SWITCH
// This script runs BEFORE React and unregisters ALL service workers
// It must be loaded as a blocking script in the HTML <head>

console.log('🔥 [Emergency SW Kill Switch] Running...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(function(registrations) {
      console.log('🔥 [Emergency SW Kill Switch] Found ' + registrations.length + ' service worker(s)');

      if (registrations.length > 0) {
        var unregisterPromises = registrations.map(function(registration) {
          console.log('🔥 [Emergency SW Kill Switch] Force unregistering:', registration.scope);
          return registration.unregister();
        });

        return Promise.all(unregisterPromises).then(function() {
          console.log('🔥 [Emergency SW Kill Switch] All service workers unregistered successfully');

          // Set a flag so we don't reload infinitely
          var hasReloaded = sessionStorage.getItem('sw_kill_switch_reloaded');
          if (!hasReloaded) {
            console.log('🔥 [Emergency SW Kill Switch] Forcing hard reload...');
            sessionStorage.setItem('sw_kill_switch_reloaded', 'true');
            // Force hard reload to clear any cached resources
            window.location.reload(true);
          } else {
            console.log('🔥 [Emergency SW Kill Switch] Already reloaded, not reloading again');
            // Clear the flag for next time
            sessionStorage.removeItem('sw_kill_switch_reloaded');
          }
        });
      } else {
        console.log('🔥 [Emergency SW Kill Switch] No service workers found, nothing to unregister');
      }
    })
    .catch(function(error) {
      console.error('🔥 [Emergency SW Kill Switch] Error:', error);
    });
} else {
  console.log('🔥 [Emergency SW Kill Switch] Service workers not supported');
}
