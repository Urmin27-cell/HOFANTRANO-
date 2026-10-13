const CACHE_NAME = 'hofantrano-pwa-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icon.svg',
  '/logo-192.png',
  '/logo-512.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache error (continuing):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-first for static assets, network-first for navigation with offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip Firestore API / google APIs from local SW cache (Firestore handles its own IndexedDB offline cache)
  if (url.origin.includes('firestore') || url.origin.includes('googleapis.com') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests: Network-first, fallback to /index.html cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html') || caches.match('/'))
    );
    return;
  }

  // Static assets: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});

// BACKGROUND NOTIFICATION SCHEDULER
// Triggers high-priority Android heads-up notification even after user leaves/minimizes app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_BACKGROUND_NOTIFICATION') {
    const { title, body, delayMs, url } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title || 'HOFANTRANO 🔔', {
        body: body || 'Fampandrenesana vaovao ao amin\'ny findainao.',
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        vibrate: [300, 100, 400, 100, 400],
        tag: 'hofantrano-bg-' + Date.now(),
        renotify: true,
        requireInteraction: true,
        data: { url: url || '/' },
        actions: [
          { action: 'open', title: 'Sokafy ny App' }
        ]
      });
    }, delayMs || 5000);
  }
});

// PUSH NOTIFICATION HANDLER
self.addEventListener('push', (event) => {
  let title = 'HOFANTRANO 🔔';
  let bodyText = 'Misy fampahatsiahivana vaovao ao amin\'ny kaontinao.';
  let targetUrl = '/';

  if (event.data) {
    try {
      const data = event.data.json();
      if (data.notification) {
        if (data.notification.title) title = data.notification.title;
        if (data.notification.body) bodyText = data.notification.body;
      }
      if (data.data) {
        if (data.data.title) title = data.data.title;
        if (data.data.body) bodyText = data.data.body;
        if (data.data.url) targetUrl = data.data.url;
      }
      if (data.title) title = data.title;
      if (data.body) bodyText = data.body;
      if (data.url) targetUrl = data.url;
    } catch (e) {
      bodyText = event.data.text() || bodyText;
    }
  }

  const options = {
    body: bodyText,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    vibrate: [300, 100, 400, 100, 400],
    tag: 'hofantrano-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: { url: targetUrl },
    actions: [
      { action: 'open', title: 'Sokafy' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event (opens/focuses the app from phone notification shade)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
