// Pulse OS Service Worker - Hardened v4 (progressive-web-app compliant)
const CACHE_NAME = 'pulse-os-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
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

// Fetch strategy: network-first for navigation, cache-first for static icons/manifest, bypass for external APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache external API requests (Supabase, GitHub, YouTube, Instagram)
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('api.github.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('graph.instagram.com')
  ) {
    return;
  }

  // Navigation requests: network-first with offline fallback page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('/');
        return (
          cached ||
          new Response(
            '<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>Pulse OS — Çevrimdışı</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:60px 20px;background:#141414;color:#f0f0ef;"><h2>⚡ Pulse OS Çevrimdışı Modda</h2><p style="color:#a0a09e;font-size:14px;max-width:400px;margin:12px auto;">İnternet bağlantısı şu anda algılanamadı. Lokal verileriniz korunmaktadır, bağlantı kurulduğunda senkronizasyon otomatik sürecektir.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          )
        );
      })
    );
    return;
  }

  // Static files (icons, svg, manifest): Cache-first with network fallback
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
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
  let data = { title: 'Pulse OS Bildirimi', body: 'Günün görevleri ve hatırlatıcılar hazır!' };
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
