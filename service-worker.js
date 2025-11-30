// service-worker.js — Atualização imediata e reload do cliente

const SW_VERSION = 'v2'; // aumente quando quiser forçar manualmente
const CACHE_NAME = `palavras-cache-${SW_VERSION}`;
const FILES_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalando: cacheia arquivos e força espera curta
self.addEventListener('install', (event) => {
  console.log('[SW] install', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  // ativa a nova versão imediatamente (pula waiting)
  self.skipWaiting();
});

// Ativando: remove caches antigos e toma controle dos clients
self.addEventListener('activate', (event) => {
  console.log('[SW] activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(k => k !== CACHE_NAME)
        .map(k => caches.delete(k))
    ))
  );
  // assume controle imediatamente
  return self.clients.claim();
});

// Fetch: tenta rede primeiro, atualiza cache; se offline, serve cache
self.addEventListener('fetch', (event) => {
  // ignore requests to chrome-extension:// and data: etc.
  if (event.request.url.startsWith('chrome-extension://') || event.request.url.startsWith('data:')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // clone e atualiza cache
        if (response && response.status === 200 && event.request.method === 'GET') {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone)).catch(()=>{});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Se receber mensagem 'skip-waiting', faz activate imediatamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING_AND_RELOAD') {
    self.skipWaiting();
  }
});
