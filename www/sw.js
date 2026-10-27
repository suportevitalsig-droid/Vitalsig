const CACHE_NAME = 'vitalsig-v3.2.0';

// Lista de arquivos essenciais para funcionamento offline em áreas remotas
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './img/icon-meu-logo.png',
  './img/meu-logo.png',
  './img/meu-logo-green.png',
  './lib/leaflet.css',
  './lib/leaflet.js',
  './lib/xlsx.full.min.js',
  './lib/jspdf.umd.min.js',
  './lib/jspdf.plugin.autotable.min.js'
];

// Instalação do Service Worker com tolerância a falhas individuais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Armazenando arquivos essenciais em cache...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[Service Worker] Erro ao carregar ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições: Cache First com fallback para rede
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
