import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { readJson } from "../lib/request.js";
import { hashPassword } from "../lib/password.js";
import { parseNewMatch, applyLinkedUsers } from "../lib/matchInput.js";
import { getCurrentUser } from "../lib/auth.js";
import { canEdit, requireView } from "../lib/matchAccess.js";
import { getGame } from "../db/games.js";
import { createMatch, getMatchRow, getMatchDetail } from "../db/matches.js";
import { getUsersByIds } from "../db/users.js";

export function registerMatches(router) {
  // Crear una partida
  router.add("POST", "/api/matches", async ({ request, env }) => {
    const body = await readJson(request);

    const gameId = Number(body.gameId);
    const game = Number.isInteger(gameId) ? await getGame(env.DB, gameId) : null;
    if (!game) throw new HttpError(404, "Juego no encontrado");

    const input = parseNewMatch(body, game);

    // Si hay sesión, la partida queda a nombre de ese usuario;
    // vincular jugadores con usuarios solo se puede estando dentro.
    const user = await getCurrentUser(request, env);
    const linkedIds = input.players.map((player) => player.userId).filter((userId) => userId !== null);
    if (linkedIds.length > 0 && !user) throw new HttpError(401, "Tienes que iniciar sesión");
    applyLinkedUsers(input.players, await getUsersByIds(env.DB, linkedIds));

    const passwordData = input.password ? await hashPassword(input.password) : null;
    const id = await createMatch(env.DB, { game, input, passwordData, createdByUserId: user?.id ?? null });

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
