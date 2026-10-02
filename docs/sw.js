// Service worker: guarda en el móvil los ficheros de la app para que se abra
// aunque no haya conexión. Primero intenta la red (así siempre ves la última
// versión) y, si falla, usa la copia guardada.
// Los datos de las partidas NO se guardan: vienen siempre del servidor.

const CACHE = "marcador-v1";
const CACHEABLE_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name !== CACHE) await caches.delete(name);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Solo los ficheros de la propia app y las tipografías; la API queda fuera
  const url = new URL(request.url);
  const isApp = url.origin === self.location.origin;
  if (!isApp && !CACHEABLE_HOSTS.includes(url.hostname)) return;

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") cache.put(request, response.clone());
    return response;
  } catch (err) {
    const saved = await cache.match(request, { ignoreSearch: true });
    if (saved) return saved;
    throw err;
  }
}
