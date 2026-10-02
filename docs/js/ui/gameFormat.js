// Textos que describen un juego (se reutilizan en la lista y en el detalle)

const WIN_MODES = {
  min: "Menos puntos gana",
  max: "Más puntos gana",
  rounds: "Por rondas",
};

const DECKS = {
  espanola: "Baraja española",
  francesa: "Baraja francesa",
  otra: "Otra baraja",
};

export function playersLabel(game) {
  return game.min_players === game.max_players
    ? `${game.min_players} jugadores`
    : `${game.min_players}–${game.max_players} jugadores`;
}

export function winModeLabel(game) {
  return WIN_MODES[game.win_mode] ?? "";
}

export function deckLabel(game) {
  return DECKS[game.deck] ?? "";
}
