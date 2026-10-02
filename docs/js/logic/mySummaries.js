import { listMatches } from "../api/matchList.js";
import { listSavedMatches, forgetMatch } from "../storage/myMatches.js";

const CODES_PER_CALL = 30;

// Resumen de las partidas guardadas en este móvil, en el orden en que se guardaron.
// Las que ya no existen en el servidor (alguien las borró) se olvidan.
export async function loadMySummaries() {
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
