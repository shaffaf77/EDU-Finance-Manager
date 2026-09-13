const CACHE = 'edu-finance-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise = fetch(e.request).then(networkResp=>{
        if(networkResp && networkResp.status === 200 && e.request.url.startsWith(self.location.origin)){
          const clone = networkResp.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request, clone));
        }
        return networkResp;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })
  );
});
