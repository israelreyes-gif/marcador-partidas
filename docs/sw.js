// Service worker: guarda en el móvil los ficheros de la app para que se abra
// aunque no haya conexión. Primero pregunta siempre al servidor si el fichero
// ha cambiado (por su fecha de modificación): si hay versión nueva la descarga
// y, si no hay conexión, usa la copia guardada.
// Los datos de las partidas NO se guardan: vienen siempre del servidor.

const CACHE = "marcador-v2";
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
    // "no-cache": el navegador revalida con el servidor antes de usar su caché
    const response = await fetch(request, { cache: "no-cache" });
    if (response.ok || response.type === "opaque") cache.put(request, response.clone());
    return response;
  } catch (err) {
    const saved = await cache.match(request, { ignoreSearch: true });
    if (saved) return saved;
    throw err;
  }
}
