import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { requireUser } from "../lib/auth.js";
import { listMatchSummaries, listUserMatchCodes } from "../db/matchSummaries.js";

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

  // Partidas de la cuenta: las que he creado o en las que juego (hace falta sesión)
  router.add("GET", "/api/me/matches", async ({ request, env }) => {
    const user = await requireUser(request, env);
    const codes = await listUserMatchCodes(env.DB, user.id);
    const matches = await listMatchSummaries(env.DB, codes);
    return json({ matches });
  });
}
