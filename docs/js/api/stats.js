import { request } from "./client.js";

// Estadísticas del usuario con sesión: { played, won, byGame: [{ game, played, won }] }
export const fetchStats = () => request("GET", "/api/me/stats").then((data) => data.stats);
