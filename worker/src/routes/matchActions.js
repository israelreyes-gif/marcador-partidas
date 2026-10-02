import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { requireEdit } from "../lib/matchAccess.js";
import { decideWinner } from "../lib/winner.js";
import { getMatchRow, getMatchDetail } from "../db/matches.js";
import { finishMatch, reopenMatch, deleteMatch } from "../db/matchLifecycle.js";

async function loadMatchForEdit({ request, env, params }) {
  const row = await getMatchRow(env.DB, params.id.toUpperCase());
  if (!row) throw new HttpError(404, "Partida no encontrada");
  await requireEdit(request, row);
  return row;
}

async function respondWithMatch(env, id) {
  const row = await getMatchRow(env.DB, id);
  return json({ match: await getMatchDetail(env.DB, row, true) });
}

// El cuerpo es opcional: { winnerPlayerId } para elegir ganador a mano
async function readOptionalBody(request) {
  try {
    const body = await request.json();
    return body !== null && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

export function registerMatchActions(router) {
  // Terminar la partida
  router.add("POST", "/api/matches/:id/finish", async (ctx) => {
    const row = await loadMatchForEdit(ctx);
    if (row.status === "finished") {
      throw new HttpError(409, "La partida ya ha terminado");
    }

    const detail = await getMatchDetail(ctx.env.DB, row, true);
    const body = await readOptionalBody(ctx.request);

    let winnerId;
    if (body.winnerPlayerId === undefined || body.winnerPlayerId === null) {
      winnerId = decideWinner(row.win_mode, detail.players);
    } else {
      winnerId = Number(body.winnerPlayerId);
      if (!detail.players.some((p) => p.id === winnerId)) {
        throw new HttpError(400, "El ganador no es un jugador de la partida");
      }
    }

    await finishMatch(ctx.env.DB, row.id, winnerId);
    return respondWithMatch(ctx.env, row.id);
  });

  // Reabrir una partida terminada
  router.add("POST", "/api/matches/:id/reopen", async (ctx) => {
    const row = await loadMatchForEdit(ctx);
    if (row.status !== "finished") {
      throw new HttpError(409, "La partida no está terminada");
    }
    await reopenMatch(ctx.env.DB, row.id);
    return respondWithMatch(ctx.env, row.id);
  });

  // Borrar la partida
  router.add("DELETE", "/api/matches/:id", async (ctx) => {
    const row = await loadMatchForEdit(ctx);
    await deleteMatch(ctx.env.DB, row.id);
    return json({ deleted: row.id });
  });
}
