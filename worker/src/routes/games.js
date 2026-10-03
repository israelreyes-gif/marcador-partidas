import { json, error } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { readJson } from "../lib/request.js";
import { getCurrentUser, requireUser } from "../lib/auth.js";
import { parseGameInput } from "../lib/gameInput.js";
import {
  listGames,
  getGameDetail,
  findGameByName,
  createGame,
  updateGame,
  countGameMatches,
  deleteGame,
} from "../db/games.js";

// Lo que se envía al cliente: sin el id del dueño, pero con "es mío" y quién lo creó
function present(row, user) {
  const { owner_user_id, owner_name, ...game } = row;
  return {
    ...game,
    isMine: user !== null && owner_user_id !== null && owner_user_id === user.id,
    ownerName: owner_name ?? null,
  };
}

// Juego editable: existe, no es de serie y es del usuario con sesión
async function requireOwnGame(request, env, params) {
  const user = await requireUser(request, env);
  const id = Number(params.id);
  const game = Number.isInteger(id) ? await getGameDetail(env.DB, id) : null;
  if (!game) throw new HttpError(404, "Juego no encontrado");
  if (game.is_builtin === 1 || game.owner_user_id !== user.id) {
    throw new HttpError(403, "Solo quien creó el juego puede cambiarlo");
  }
  return { user, game };
}

async function ensureNameFree(env, name, exceptId) {
  if (await findGameByName(env.DB, name, exceptId)) {
    throw new HttpError(409, "Ya existe un juego con ese nombre");
  }
}

export function registerGames(router) {
  // Lista de juegos (con filtros opcionales)
  router.add("GET", "/api/games", async ({ request, env, url }) => {
    const user = await getCurrentUser(request, env);
    const rows = await listGames(env.DB, {
      deck: url.searchParams.get("deck"),
      q: url.searchParams.get("q")?.trim(),
    });
    return json({ games: rows.map((row) => present(row, user)) });
  });

  // Detalle de un juego
  router.add("GET", "/api/games/:id", async ({ request, env, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return error("Identificador no válido", 400);

    const user = await getCurrentUser(request, env);
    const game = await getGameDetail(env.DB, id);
    return game ? json({ game: present(game, user) }) : error("Juego no encontrado", 404);
  });

  // Crear un juego propio
  router.add("POST", "/api/games", async ({ request, env }) => {
    const user = await requireUser(request, env);
    const input = parseGameInput(await readJson(request));
    await ensureNameFree(env, input.name, 0);

    const id = await createGame(env.DB, input, user.id);
    return json({ game: present(await getGameDetail(env.DB, id), user) }, 201);
  });

  // Editar un juego propio
  router.add("PUT", "/api/games/:id", async ({ request, env, params }) => {
    const { user, game } = await requireOwnGame(request, env, params);
    const input = parseGameInput(await readJson(request));
    await ensureNameFree(env, input.name, game.id);

    await updateGame(env.DB, game.id, input);
    return json({ game: present(await getGameDetail(env.DB, game.id), user) });
  });

  // Borrar un juego propio (solo si no tiene partidas)
  router.add("DELETE", "/api/games/:id", async ({ request, env, params }) => {
    const { game } = await requireOwnGame(request, env, params);
    if ((await countGameMatches(env.DB, game.id)) > 0) {
      throw new HttpError(409, "No se puede borrar: ya hay partidas de este juego");
    }
    await deleteGame(env.DB, game.id);
    return json({ ok: true });
  });
}
