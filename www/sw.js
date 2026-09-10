const CACHE_NAME = 'vital-v2'; // Incrementado para forçar a atualização

// Lista de arquivos locais essenciais para o funcionamento offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './img/icon-meu-logo.png',
  './img/meu-logo.png',
  './lib/leaflet.css',
  './lib/leaflet.js',
  './lib/xlsx.full.min.js',
  './lib/jspdf.umd.min.js',
  './lib/jspdf.plugin.autotable.min.js'
];

// Instalação do Service Worker com tratamento tolerante a falhas individuais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Armazenando arquivos em cachê...');
      // Promise.allSettled tenta cachear arquivo por arquivo sem quebrar a instalação se um falhar
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

// Ativação e limpeza de cachês antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cachê antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições: Tenta buscar do cachê primeiro, se não encontrar vai para a rede
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET ou chamadas de API externas/UploadThing
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
