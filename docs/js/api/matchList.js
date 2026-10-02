import { request } from "./client.js";

// Resumen de varias partidas a la vez (como máximo 30 códigos por llamada).
// Las partidas privadas llegan como { id, locked: true } sin más datos.
export const listMatches = (codes) =>
  request("GET", `/api/matches?codes=${codes.map(encodeURIComponent).join(",")}`).then(
    (data) => data.matches
  );
