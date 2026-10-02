import { json } from "../lib/response.js";

// Ruta de prueba: comprueba que el Worker llega a D1
export function registerHealth(router) {
  router.add("GET", "/api/health", async ({ env }) => {
    const row = await env.DB.prepare("SELECT COUNT(*) AS games FROM games").first();
    return json({ ok: true, games: row.games });
  });
}
