// Registra o Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // O caminho para o service-worker.js é relativo à raiz do site.
    // Se index.html está na raiz e service-worker.js também, o caminho é '/service-worker.js' ou 'service-worker.js'
    navigator.serviceWorker
      .register("service-worker.js")
      .then(function (registration) {
        console.log(
          "ServiceWorker: Registro bem-sucedido no escopo: ",
          registration.scope
        );
      })
      .catch(function (err) {
        console.error("ServiceWorker: Falha no registro: ", err);
      });
  });
} else {
  console.log("Service workers não são suportados neste navegador.");
}
