/* офлайн-кэш: сеть в приоритете, кэш как запас */
var C = 'sessia-v2';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var u = new URL(e.request.url);
  if(e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r && r.ok){ var cp = r.clone(); caches.open(C).then(function(c){ c.put(e.request, cp); }); }
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(r){
        if(r) return r;
        if(u.pathname.slice(-1) === '/') return caches.match(u.pathname + 'index.html');
      });
    })
  );
});
