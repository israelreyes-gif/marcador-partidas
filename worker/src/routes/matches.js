import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { readJson } from "../lib/request.js";
import { hashPassword } from "../lib/password.js";
import { parseNewMatch } from "../lib/matchInput.js";
import { canEdit, requireView } from "../lib/matchAccess.js";
import { getGame } from "../db/games.js";
import { createMatch, getMatchRow, getMatchDetail } from "../db/matches.js";

export function registerMatches(router) {
  // Crear una partida
  router.add("POST", "/api/matches", async ({ request, env }) => {
    const body = await readJson(request);

    const gameId = Number(body.gameId);
    const game = Number.isInteger(gameId) ? await getGame(env.DB, gameId) : null;
    if (!game) throw new HttpError(404, "Juego no encontrado");

    const input = parseNewMatch(body, game);
    const passwordData = input.password ? await hashPassword(input.password) : null;
    const id = await createMatch(env.DB, { game, input, passwordData });

    const row = await getMatchRow(env.DB, id);
    const match = await getMatchDetail(env.DB, row, true);
    return json({ match }, 201);
  });

  // Consultar una partida por su código
  router.add("GET", "/api/matches/:id", async ({ request, env, params }) => {
    const row = await getMatchRow(env.DB, params.id.toUpperCase());
    if (!row) throw new HttpError(404, "Partida no encontrada");

    await requireView(request, row);
    const match = await getMatchDetail(env.DB, row, await canEdit(request, row));
    return json({ match });
  });
}
