// CCAA复习台 Service Worker（v6.13.7）
// 策略：HTML 页面请求一律 network-first——联网时永远拿服务器最新版，
// 解决 GitHub Pages 默认 10 分钟缓存导致"更新后看不到新内容"的问题；离线时才回退缓存。
const CACHE = 'ccaa-' + 'v6.13.7';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('ccaa-') === 0 && k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const accept = req.headers.get('accept') || '';
  const isHTML = req.mode === 'navigate' || accept.indexOf('text/html') !== -1;
  if (isHTML) {
    e.respondWith(
      fetch(req).then(function (res) {
        const copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./'); });
      })
    );
  }
});
