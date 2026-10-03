import { request } from "./client.js";

// Resumen de varias partidas a la vez (como máximo 30 códigos por llamada).
// Las partidas privadas llegan como { id, locked: true } sin más datos.
export const listMatches = (codes) =>
  request("GET", `/api/matches?codes=${codes.map(encodeURIComponent).join(",")}`).then(
    (data) => data.matches
  );

// Resumen de las partidas de la cuenta: las que has creado o en las que juegas.
// Hace falta haber iniciado sesión.
export const listAccountMatches = () => request("GET", "/api/me/matches").then((data) => data.matches);
