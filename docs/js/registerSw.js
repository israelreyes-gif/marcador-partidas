// Activa el service worker (si el navegador lo admite)
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // sin service worker la app funciona igual, solo que sin modo sin conexión
    });
  });
}
