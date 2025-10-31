# Service Worker Automatic Versioning

## Overview

Your PWA now has **automatic service worker versioning** that ensures old caches are cleared on every deployment!

## How It Works

### 1. Build Process
When you run `npm run build`, this happens automatically:

```
1. prebuild  → Updates SW_VERSION to current timestamp
2. build     → Next.js builds the app with versioned service worker
3. postbuild → Restores SW_VERSION placeholder for version control
```

### 2. Version Management

**Development (`public/sw.js`):**
```javascript
const SW_VERSION = '__SW_VERSION__'; // Placeholder
```

**After build (in `.next/static/`):**
```javascript
const SW_VERSION = '1730365200000'; // Actual timestamp
```

### 3. Cache Cleanup

When a new version is deployed:
1. Browser detects new service worker
2. Old service worker installs new one
3. **Activate event deletes ALL old caches** (lines 30-39 in sw.js)
4. New cache created with new version number
5. Old service worker is replaced immediately (`skipWaiting()`)

## Benefits

✅ **Automatic** - No manual version updates needed
✅ **Reliable** - Every deployment gets a unique version
✅ **Clean** - Old caches automatically deleted
✅ **Fast** - Users get updates immediately (`skipWaiting()` + `claim()`)

## Versioning Strategy

We use **timestamp versioning** for maximum reliability:

```javascript
// Version: 1730365200000 (Unix timestamp in milliseconds)
// Cache:   buysel-v1730365200000
```

### Why Timestamps?
- ✅ Always unique
- ✅ No conflicts between deployments
- ✅ Easy to debug (can identify exact build time)
- ✅ Automatically increments on every build

## Deployment Workflow

### Local Development
```bash
npm run dev
# Service worker uses placeholder version
# Hot reload for code changes
```

### Production Build
```bash
npm run build
# ✅ prebuild:  Updates sw.js with timestamp version
# ⚙️  build:     Next.js builds the app
# ✅ postbuild: Restores sw.js placeholder
```

### Azure Deployment
```bash
# Your GitHub Actions workflow automatically:
1. Runs npm run build (includes versioning)
2. Deploys to Azure Static Web Apps
3. Users get new service worker with unique version
4. Old caches cleared automatically
```

## Testing Cache Updates

### 1. Check Current Version
Open browser console:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW Version:', reg.active);
});
```

### 2. Verify Cache Cleanup
```javascript
caches.keys().then(cacheNames => {
  console.log('Current caches:', cacheNames);
  // Should only see: ['buysel-v<current-timestamp>']
  // Old versions should be deleted
});
```

### 3. Force Update (Testing)
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update(); // Manually check for updates
});
```

## Console Logs

You'll see these in the browser console:

```
Service Worker v1730365200000 installing...
Caching files for buysel-v1730365200000
Service Worker v1730365200000 installed successfully
Service Worker v1730365200000 activating...
Deleting old cache: buysel-v1730365100000
Service Worker v1730365200000 activated successfully
```

## What Gets Cached

Current caching strategy (in `sw.js`):

```javascript
const urlsToCache = [
  '/',
  '/offline.html',
];
```

### Fetch Strategy
- **Navigation requests**: Network first, offline fallback
- **Static assets**: Cache first, network fallback
- **API calls**: Network only (not cached)

## Troubleshooting

### Old Cache Not Deleted?

1. **Check version update:**
   ```bash
   cat public/sw.js | grep SW_VERSION
   # Should show: const SW_VERSION = '__SW_VERSION__';
   ```

2. **Check build output:**
   ```bash
   npm run build
   # Should see: ✅ Service worker version updated to: <timestamp>
   ```

3. **Force refresh:**
   - Chrome: DevTools → Application → Service Workers → Unregister
   - Or: Hard reload (Ctrl+Shift+R / Cmd+Shift+R)

### Service Worker Not Updating?

1. **Clear all caches manually:**
   ```javascript
   caches.keys().then(keys => {
     Promise.all(keys.map(key => caches.delete(key)))
       .then(() => console.log('All caches cleared'));
   });
   ```

2. **Unregister and reload:**
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister());
     window.location.reload();
   });
   ```

## Best Practices

### ✅ DO:
- Run `npm run build` before every deployment
- Check console for version logs
- Test on incognito/private browsing for clean slate
- Monitor cache size (DevTools → Application → Storage)

### ❌ DON'T:
- Manually edit version in sw.js (it will be overwritten)
- Deploy without running build
- Commit versioned sw.js (postbuild restores it)
- Cache API responses (they change frequently)

## Adding More Cached Resources

To cache additional files, edit `sw.js`:

```javascript
const urlsToCache = [
  '/',
  '/offline.html',
  '/logo192.png',        // Add this
  '/logo512.png',        // Add this
  '/static/css/main.css', // Add this
];
```

**Important:** More cached files = longer install time!

## Advanced: Version Tracking

Want to track versions in your database?

```javascript
// In your app
const SW_VERSION = '__SW_VERSION__';

// Send to analytics
fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify({
    event: 'sw_version',
    version: SW_VERSION,
    userAgent: navigator.userAgent
  })
});
```

## Summary

Your service worker now:
- ✅ Auto-versions on every build
- ✅ Clears old caches automatically
- ✅ Updates immediately without user intervention
- ✅ Keeps source code clean (placeholder restored after build)
- ✅ Works seamlessly with your deployment pipeline

**No manual intervention needed** - just build and deploy! 🚀
