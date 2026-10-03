import { listMatches, listAccountMatches } from "../api/matchList.js";
import { listSavedMatches, forgetMatch } from "../storage/myMatches.js";
import { getToken } from "../storage/session.js";

const CODES_PER_CALL = 30;

// Partidas guardadas en este móvil. Las que ya no existen en el servidor
// (alguien las borró) se olvidan.
async function loadSavedSummaries() {
  const codes = listSavedMatches().map((item) => item.id);
  if (codes.length === 0) return [];

  const found = new Map();
  for (let start = 0; start < codes.length; start += CODES_PER_CALL) {
    const matches = await listMatches(codes.slice(start, start + CODES_PER_CALL));
    for (const match of matches) found.set(match.id, match);
  }

  for (const code of codes) {
    if (!found.has(code)) forgetMatch(code);
  }
  return codes.filter((code) => found.has(code)).map((code) => found.get(code));
}

// Partidas de la cuenta (si hay sesión). Si falla (sin conexión, sesión caducada),
// no se muestran: las del móvil siguen funcionando igual.
async function loadAccountSummaries() {
  if (!getToken()) return [];
  try {
    return await listAccountMatches();
  } catch {
    return [];
  }
}

// De más reciente a más antigua; las privadas (sin datos) van al final
function byRecentActivity(a, b) {
  if (a.locked !== b.locked) return a.locked ? 1 : -1;
  return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
}

// Partidas guardadas en este móvil + las de tu cuenta, sin repetidas
export async function loadMySummaries() {
  const [saved, account] = await Promise.all([loadSavedSummaries(), loadAccountSummaries()]);

  const byId = new Map();
  for (const match of [...account, ...saved]) byId.set(match.id, match);
  return [...byId.values()].sort(byRecentActivity);
}
