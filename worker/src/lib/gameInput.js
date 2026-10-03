import { HttpError } from "./errors.js";

const DECKS = ["espanola", "francesa", "otra"];
const WIN_MODES = ["min", "max", "rounds"];
const MIN_PLAYERS_ALLOWED = 2;
const MAX_PLAYERS_ALLOWED = 8;
const MAX_TEXT = 5000;

function parseText(value, label) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > MAX_TEXT) {
    throw new HttpError(400, `${label}: máximo ${MAX_TEXT} caracteres`);
  }
  return value.trim();
}

// Valida los datos de un juego propio (al crearlo o al editarlo)
export function parseGameInput(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 40) {
    throw new HttpError(400, "El nombre debe tener de 2 a 40 caracteres");
  }

  const minPlayers = body.minPlayers;
  const maxPlayers = body.maxPlayers;
  const validCount = (n) => Number.isInteger(n) && n >= MIN_PLAYERS_ALLOWED && n <= MAX_PLAYERS_ALLOWED;
  if (!validCount(minPlayers) || !validCount(maxPlayers) || minPlayers > maxPlayers) {
    throw new HttpError(400, `El número de jugadores debe estar entre ${MIN_PLAYERS_ALLOWED} y ${MAX_PLAYERS_ALLOWED}`);
  }

  if (!DECKS.includes(body.deck)) throw new HttpError(400, "Tipo de baraja no válido");
  if (!WIN_MODES.includes(body.winMode)) throw new HttpError(400, "Modo de victoria no válido");

  // El límite de puntos solo tiene sentido si ganan "menos" o "más" puntos
  let scoreLimit = body.scoreLimit ?? null;
  if (body.winMode === "rounds") scoreLimit = null;
  if (scoreLimit !== null && !(Number.isInteger(scoreLimit) && scoreLimit > 0 && scoreLimit <= 100000)) {
    throw new HttpError(400, "Límite de puntos no válido");
  }

  return {
    name,
    minPlayers,
    maxPlayers,
    deck: body.deck,
    winMode: body.winMode,
    scoreLimit,
    rules: parseText(body.rules, "Reglas"),
    howToPlay: parseText(body.howToPlay, "Cómo se juega"),
    scoring: parseText(body.scoring, "Puntuación"),
  };
}
