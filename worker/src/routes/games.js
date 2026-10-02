import { json, error } from "../lib/response.js";
import { listGames, getGame } from "../db/games.js";

export function registerGames(router) {
  // Lista de juegos (con filtros opcionales)
  router.add("GET", "/api/games", async ({ env, url }) => {
    const games = await listGames(env.DB, {
      deck: url.searchParams.get("deck"),
      q: url.searchParams.get("q")?.trim(),
    });
    return json({ games });
  });

  // Detalle de un juego
  router.add("GET", "/api/games/:id", async ({ env, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return error("Identificador no válido", 400);

    const game = await getGame(env.DB, id);
    return game ? json({ game }) : error("Juego no encontrado", 404);
  });
}
