import { HttpError } from "./errors.js";

const MIN_POINTS = -10000;
const MAX_POINTS = 10000;

// Valida los puntos de una ronda: { scores: { "<idJugador>": puntos, ... } }
// Tienen que venir todos los jugadores de la partida, ni uno más ni uno menos.
export function parseRoundScores(body, playerIds) {
  const scores = body.scores;
  if (scores === null || typeof scores !== "object" || Array.isArray(scores)) {
    throw new HttpError(400, "Faltan las puntuaciones");
  }

  const expected = playerIds.map(String);
  const complete =
    Object.keys(scores).length === expected.length &&
    expected.every((id) => Object.hasOwn(scores, id));
  if (!complete) {
    throw new HttpError(400, "Hay que indicar los puntos de todos los jugadores");
  }

  const parsed = {};
  for (const id of expected) {
    const points = scores[id];
    if (!Number.isInteger(points) || points < MIN_POINTS || points > MAX_POINTS) {
      throw new HttpError(
        400,
        `Los puntos deben ser un número entero entre ${MIN_POINTS} y ${MAX_POINTS}`
      );
    }
    parsed[id] = points;
  }
  return parsed;
}
