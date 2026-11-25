/* SlimeGochi service worker — offline shell */
var V = 'slimegochi-v1.0.1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(V)
      .then(function (c) { return c.addAll(SHELL).catch(function () {}); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);

  if (u.origin === location.origin) {
    e.respondWith(caches.match(r).then(function (hit) {
      return hit || fetch(r).then(function (res) {
        var cp = res.clone();
        caches.open(V).then(function (c) { c.put(r, cp); });
        return res;
      }).catch(function () { return caches.match('./index.html'); });
    }));
  } else if (/tailwindcss|fonts\.googleapis|fonts\.gstatic/.test(u.host)) {
    e.respondWith(caches.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) {
        var cp = res.clone();
        caches.open(V).then(function (c) { c.put(r, cp); });
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    }));
  }
});