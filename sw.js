/* Offline simplificado: mantém recursos críticos de login sempre atualizados. */
const CACHE='zix-shell-1345a';
const SHELL=['./index.html','./style.css','./zix-afiliados.css','./icons/zix-192.png','./icons/zix-512.png'];
self.addEventListener('install',ev=>ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',ev=>ev.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',ev=>{
 const r=ev.request, url=new URL(r.url);
 if(r.method!=='GET'||url.origin!==self.location.origin||url.pathname.endsWith('/admin.html')||url.pathname.endsWith('/config.js')||url.pathname.endsWith('/site-brand-settings.json'))return;
 if(r.mode==='navigate'){
  ev.respondWith(fetch(r).catch(()=>caches.match('./index.html'))); return;
 }
 if(/\.(?:png|jpg|jpeg|webp|css)$/.test(url.pathname)){
  ev.respondWith(fetch(r).catch(()=>caches.match(r))); return;
 }
});
