import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { listMatchSummaries } from "../db/matchSummaries.js";

const MAX_CODES = 30;
const CODE_PATTERN = /^[A-Z0-9]{6}$/;

export function registerMatchList(router) {
  // Resumen de las partidas cuyos códigos guarda el móvil: /api/matches?codes=ABC234,XYZ789
  router.add("GET", "/api/matches", async ({ env, url }) => {
    const raw = (url.searchParams.get("codes") ?? "")
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean);

    if (raw.length > MAX_CODES) {
      throw new HttpError(400, `Máximo ${MAX_CODES} partidas por consulta`);
    }

    // Se descartan los códigos mal formados y los repetidos
    const codes = [...new Set(raw.filter((code) => CODE_PATTERN.test(code)))];
    const matches = await listMatchSummaries(env.DB, codes);
    return json({ matches });
  });
}
