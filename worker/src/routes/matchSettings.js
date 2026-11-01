import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { readJson } from "../lib/request.js";
import { requireEdit } from "../lib/matchAccess.js";
import { parseWinMode } from "../lib/winModeInput.js";
import { getMatchRow, getMatchDetail } from "../db/matches.js";
import { setWinMode } from "../db/matchSettings.js";

export function registerMatchSettings(router) {
  // Cambiar quién gana (menos o más puntos) con la partida en marcha
  router.add("PUT", "/api/matches/:id/win-mode", async ({ request, env, params }) => {
    const row = await getMatchRow(env.DB, params.id.toUpperCase());
    if (!row) throw new HttpError(404, "Partida no encontrada");
    await requireEdit(request, row);

    if (row.status === "finished") {
      throw new HttpError(409, "La partida ya ha terminado: reábrela para cambiar quién gana");
    }
    if (row.win_mode === "rounds") {
      throw new HttpError(409, "Esta partida se gana por rondas y no se puede cambiar");
    }

    const winMode = parseWinMode(await readJson(request));
    await setWinMode(env.DB, row.id, winMode);

    const updated = await getMatchRow(env.DB, row.id);
    return json({ match: await getMatchDetail(env.DB, updated, true) });
  });
}
