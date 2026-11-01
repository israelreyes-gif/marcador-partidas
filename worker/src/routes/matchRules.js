import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { readJson } from "../lib/request.js";
import { requireEdit } from "../lib/matchAccess.js";
import { parseCustomRules } from "../lib/rulesInput.js";
import { getMatchRow, getMatchDetail } from "../db/matches.js";
import { setCustomRules } from "../db/matchRules.js";

export function registerMatchRules(router) {
  // Cambiar las reglas de esta partida (no toca el juego, solo esta partida).
  // Se puede hacer en cualquier momento, también con la partida en marcha.
  router.add("PUT", "/api/matches/:id/rules", async ({ request, env, params }) => {
    const row = await getMatchRow(env.DB, params.id.toUpperCase());
    if (!row) throw new HttpError(404, "Partida no encontrada");
    await requireEdit(request, row);

    const text = parseCustomRules(await readJson(request));
    await setCustomRules(env.DB, row.id, text);

    const updated = await getMatchRow(env.DB, row.id);
    return json({ match: await getMatchDetail(env.DB, updated, true) });
  });
}
