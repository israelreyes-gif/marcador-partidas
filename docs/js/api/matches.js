import { request } from "./client.js";

// Llamadas a la API de partidas. `password` es opcional: si la partida
// la tiene, hace falta para editar (y para ver, si es privada).

const path = (id) => `/api/matches/${encodeURIComponent(id)}`;

export const getMatch = (id, password) =>
  request("GET", path(id), { password }).then((data) => data.match);

export const addRound = (id, scores, password) =>
  request("POST", `${path(id)}/rounds`, { body: { scores }, password }).then((data) => data.match);

export const updateRound = (id, number, scores, password) =>
  request("PUT", `${path(id)}/rounds/${number}`, { body: { scores }, password }).then(
    (data) => data.match
  );

export const undoRound = (id, password) =>
  request("DELETE", `${path(id)}/rounds/last`, { password }).then((data) => data.match);

// winnerPlayerId es opcional: sin él, gana quien corresponda según los puntos
export const finishMatch = (id, winnerPlayerId, password) =>
  request("POST", `${path(id)}/finish`, {
    body: winnerPlayerId === undefined ? undefined : { winnerPlayerId },
    password,
  }).then((data) => data.match);

export const reopenMatch = (id, password) =>
  request("POST", `${path(id)}/reopen`, { password }).then((data) => data.match);

export const deleteMatch = (id, password) => request("DELETE", path(id), { password });
