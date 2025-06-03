const CACHE_NAME = "leitor-afd-pwa-cache-v1.4"; // Versão incrementada!
const urlsToCache = [
  "/",
  "index.html",
  "css/reset.css",
  "css/style.css",
  "js/app.js",
  "js/script.js",
  "js/fileWorker.js",
  "manifest.json",
  "AFD00004004330144881.txt",
  // Seus ícones:
  "icons/android-chrome-192x192.png",
  "icons/android-chrome-512x512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32x32.png",
  "icons/favicon-16x16.png",
  "icons/favicon.ico",
];

// Evento de Instalação: (Restante do código do service worker permanece o mesmo da Parte 2)
self.addEventListener("install", function (event) {
  console.log("[ServiceWorker] Instalando v" + CACHE_NAME);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log(
          "[ServiceWorker] Cache aberto, adicionando arquivos principais ao cache."
        );
        return cache.addAll(
          urlsToCache.map((url) => new Request(url, { cache: "reload" }))
        );
      })
      .then(function () {
        console.log(
          "[ServiceWorker] Todos os arquivos foram cacheados com sucesso."
        );
        return self.skipWaiting();
      })
      .catch(function (error) {
        console.error(
          "[ServiceWorker] Falha ao cachear arquivos durante a instalação:",
          error
        );
      })
  );
});

// Evento de Ativação: (Permanece o mesmo)
self.addEventListener("activate", function (event) {
  console.log("[ServiceWorker] Ativando v" + CACHE_NAME);
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log("[ServiceWorker] Removendo cache antigo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        console.log(
          "[ServiceWorker] Cache antigo removido, novo Service Worker ativado e controlando clientes."
        );
        return self.clients.claim();
      })
  );
});

// Evento Fetch: (Permanece o mesmo)
self.addEventListener("fetch", function (event) {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        var fetchPromise = fetch(event.request)
          .then(function (networkResponse) {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(function (error) {
            console.error(
              "[ServiceWorker] Erro ao buscar na rede:",
              event.request.url,
              error
            );
            throw error;
          });
        return response || fetchPromise;
      });
    })
  );
});
