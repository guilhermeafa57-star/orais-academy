/* Orais Academy — service worker do shell */
var CACHE = 'orais-academy-v2';
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
// Só o casco fica em cache; o app em si (Apps Script) sempre vem da rede.
// index.html e manifest: rede primeiro (para atualizações aparecerem), cache só se estiver offline.
self.addEventListener('fetch', function (e) {
  if (e.request.url.indexOf(self.location.origin) !== 0) return;
  var u = e.request.url;
  var vivo = e.request.mode === 'navigate' || /index\.html|manifest\.json|\/$/.test(u.split('?')[0]);
  if (vivo) {
    e.respondWith(fetch(e.request).then(function (r) {
      var c = r.clone(); caches.open(CACHE).then(function (k) { k.put(e.request, c); }); return r;
    }).catch(function () { return caches.match(e.request); }));
  } else {
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
