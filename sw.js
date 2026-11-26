/* Manutenzioni da programmare - salvataggio del programma per l'uso offline */
const CACHE='manutenzioni-v4h';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192_1.png','./icon-512_1.png',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE&&n!=='condivisi').map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  /* File ricevuto dal menu Condividi di Android (es. da WhatsApp): lo salva e apre l'app che lo importa */
  if(r.method==='POST'&&new URL(r.url).searchParams.has('share-target')){
    e.respondWith((async()=>{try{const fd=await r.formData();const f=fd.getAll('file')[0];
      if(f){const c=await caches.open('condivisi');await c.put('./file-condiviso',new Response(f))}}catch(err){}
      return Response.redirect('./?import-condiviso',303)})());return}
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  /* File dell'app (pagina, manifest, icone): sempre prima dalla rete, la copia salvata solo se manca la rete */
  if(u.origin===location.origin){
    const key=r.mode==='navigate'?'./index.html':r;
    e.respondWith(fetch(r.url,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(key,c))}return res})
      .catch(()=>caches.match(key).then(m=>m||caches.match('./index.html'))));return}
  /* Librerie e caratteri esterni: prima la copia salvata */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{
    if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>m)));
});
