// Activa el service worker (si el navegador lo admite) y busca versiones nuevas
// de él cada vez que se abre la app o se vuelve a ella.
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("sw.js", {
        updateViaCache: "none",
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update().catch(() => {});
      });
    } catch (err) {
      // sin service worker la app funciona igual, solo que sin modo sin conexión
    }
  });
}
