// Pulse OS Service Worker - Hardened v3
const CACHE_NAME = 'pulse-os-v3';
const OFFLINE_URLS = ['/', '/manifest.json', '/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge outdated caches to prevent stale code accumulation and cache poisoning
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('/');
        return (
          cached ||
          new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse OS - Çevrimdışı</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>İnternet Bağlantısı Yok</h2><p>Pulse OS çevrimdışı modda çalışabilir. Lütfen bağlantınızı kontrol edip sayfayı yenileyin.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        );
      })
    );
  }
});

// PWA Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Web Push event listener
self.addEventListener('push', (event) => {
  let data = { title: 'Pulse OS Bildirimi', body: 'Yeni bir güncelleme var!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Pulse OS', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
