/* Orais Academy — service worker do shell */
var CACHE = 'orais-academy-v1';
var ASSETS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
// Só o casco fica em cache; o app em si (Apps Script) sempre vem da rede
self.addEventListener('fetch', function (e) {
  if (e.request.url.indexOf(self.location.origin) === 0) {
    e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
  }
});

// Push (Firebase) — recebe e mostra a notificação
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data.json(); } catch (err) { d = { notification: { title: 'Orais Academy', body: e.data ? e.data.text() : '' } }; }
  var n = d.notification || d.data || {};
  e.waitUntil(self.registration.showNotification(n.title || 'Orais Academy', {
    body: n.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(function (ws) {
    if (ws.length) return ws[0].focus();
    return clients.openWindow('./');
  }));
});

