// Dirección de la API. Pasa por el proxy de Netlify para evitar el bloqueo
// de LaLiga sobre Cloudflare; el proxy reenvía a nuestro Worker.
export const API_URL = "https://israelreyes-proxy.netlify.app/marcador";
