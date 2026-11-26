/* Manutenzioni da programmare - salvataggio del programma per l'uso offline */
const CACHE='manutenzioni-v4e';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192_1.png','./icon-512_1.png',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  /* Pagina dell'app: prima la rete (per gli aggiornamenti), se manca la rete la copia salvata */
  if(r.mode==='navigate'||(u.origin===location.origin&&u.pathname.endsWith('.html'))){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return res})
      .catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));return}
  /* Librerie, caratteri e icone: prima la copia salvata */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{
    if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>m)));
});
