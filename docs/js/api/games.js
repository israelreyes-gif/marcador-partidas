import { request } from "./client.js";

// Juegos propios (hace falta sesión). Los datos del juego:
// { name, minPlayers, maxPlayers, deck, winMode, scoreLimit, rules, howToPlay, scoring }
export const createGame = (data) => request("POST", "/api/games", { body: data }).then((r) => r.game);

export const updateGame = (id, data) =>
  request("PUT", `/api/games/${encodeURIComponent(id)}`, { body: data }).then((r) => r.game);

export const deleteGame = (id) => request("DELETE", `/api/games/${encodeURIComponent(id)}`);
