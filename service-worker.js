const CACHE_NAME = "leitor-afd-pwa-cache-v1.1"; // Incremente a versão se fizer alterações significativas nos arquivos cacheados
const urlsToCache = [
  "/", // Atalho para index.html
  "index.html",
  "css/reset.css",
  "css/style.css",
  "js/app.js",
  "js/script.js",
  "js/fileWorker.js",
  "manifest.json",
  "AFD00004004330144881.txt",
  // Seus ícones (certifique-se que os caminhos estão corretos a partir da raiz)
  "icons/android-chrome-192x192.png",
  "icons/android-chrome-512x512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32x32.png",
  "icons/favicon-16x16.png",
  "icons/favicon.ico", // Se você tem um .ico, adicione também
  "notepad.png", // Se este é o seu favicon principal usado no index.html
];

// Evento de Instalação: Cacheia os arquivos principais da aplicação
self.addEventListener("install", function (event) {
  console.log("[ServiceWorker] Instalando...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log(
          "[ServiceWorker] Cache aberto, adicionando arquivos principais ao cache."
        );
        return cache.addAll(
          urlsToCache.map((url) => new Request(url, { cache: "reload" }))
        ); // Garante que pegue da rede na instalação
      })
      .then(function () {
        console.log(
          "[ServiceWorker] Todos os arquivos foram cacheados com sucesso."
        );
        return self.skipWaiting(); // Força o novo service worker a ativar imediatamente
      })
      .catch(function (error) {
        console.error(
          "[ServiceWorker] Falha ao cachear arquivos durante a instalação:",
          error
        );
      })
  );
});

// Evento de Ativação: Limpa caches antigos
self.addEventListener("activate", function (event) {
  console.log("[ServiceWorker] Ativando...");
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
        return self.clients.claim(); // Torna-se o service worker ativo para todas as abas abertas
      })
  );
});

// Evento Fetch: Intercepta as requisições de rede
// Estratégia: Cache first, then network (com atualização em segundo plano para assets)
self.addEventListener("fetch", function (event) {
  // console.log('[ServiceWorker] Buscando:', event.request.url);

  // Para requisições de navegação (ex: HTML), tente a rede primeiro para conteúdo fresco,
  // mas caia para o cache se offline.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a rede funcionar, clone e coloque no cache
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Se a rede falhar, tente pegar do cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para outros assets (CSS, JS, Imagens), use a estratégia "Stale-While-Revalidate"
  // Responde do cache imediatamente se disponível (rápido),
  // e em paralelo, busca na rede para atualizar o cache para a próxima vez.
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
            // Poderia retornar uma resposta offline padrão para imagens/assets aqui se desejado
            throw error;
          });
        return response || fetchPromise;
      });
    })
  );
});
