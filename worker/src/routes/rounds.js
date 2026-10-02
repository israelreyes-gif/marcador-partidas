import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { readJson } from "../lib/request.js";
import { requireEdit } from "../lib/matchAccess.js";
import { parseRoundScores } from "../lib/roundInput.js";
import { getMatchRow, getMatchDetail } from "../db/matches.js";
import { getPlayerIds, addRound, updateRound, deleteLastRound } from "../db/rounds.js";

// Carga la partida y comprueba que se puede modificar
async function loadEditableMatch({ request, env, params }) {
  const row = await getMatchRow(env.DB, params.id.toUpperCase());
  if (!row) throw new HttpError(404, "Partida no encontrada");

  await requireEdit(request, row);
  if (row.status === "finished") {
    throw new HttpError(409, "La partida ya ha terminado");
  }
  return row;
}

// Devuelve la partida actualizada
async function respondWithMatch(env, id, status = 200) {
  const row = await getMatchRow(env.DB, id);
  return json({ match: await getMatchDetail(env.DB, row, true) }, status);
}

export function registerRounds(router) {
  // Apuntar una ronda nueva
  router.add("POST", "/api/matches/:id/rounds", async (ctx) => {
    const row = await loadEditableMatch(ctx);
    const body = await readJson(ctx.request);
    const playerIds = await getPlayerIds(ctx.env.DB, row.id);
    const scores = parseRoundScores(body, playerIds);

    try {
      await addRound(ctx.env.DB, row.id, scores);
    } catch (err) {
      if (String(err.message).includes("UNIQUE")) {
        throw new HttpError(409, "Se acaba de apuntar otra ronda: recarga la partida");
      }
      throw err;
    }
    return respondWithMatch(ctx.env, row.id, 201);
  });

  // Corregir una ronda ya apuntada
  router.add("PUT", "/api/matches/:id/rounds/:number", async (ctx) => {
    const row = await loadEditableMatch(ctx);
    const number = Number(ctx.params.number);
    if (!Number.isInteger(number) || number < 1) {
      throw new HttpError(400, "Número de ronda no válido");
    }

    const body = await readJson(ctx.request);
    const playerIds = await getPlayerIds(ctx.env.DB, row.id);
    const scores = parseRoundScores(body, playerIds);

    const updated = await updateRound(ctx.env.DB, row.id, number, scores);
    if (!updated) throw new HttpError(404, "Ronda no encontrada");
    return respondWithMatch(ctx.env, row.id);
  });

  // Deshacer la última ronda
  router.add("DELETE", "/api/matches/:id/rounds/last", async (ctx) => {
    const row = await loadEditableMatch(ctx);
    const deleted = await deleteLastRound(ctx.env.DB, row.id);
    if (deleted === null) throw new HttpError(404, "No hay rondas que deshacer");
    return respondWithMatch(ctx.env, row.id);
  });
}
