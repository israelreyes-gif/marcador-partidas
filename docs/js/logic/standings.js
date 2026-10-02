// Clasificación de una partida (sin nada de pantalla)

// En "menos puntos gana" manda el total más bajo; en los demás casos, el más alto
function lowerIsBetter(match) {
  return match.winMode === "min";
}

// Puesto de cada jugador: { idJugador: 1, ... }. Los empatados comparten puesto.
export function rankPlayers(match) {
  const sorted = [...match.players].sort((a, b) =>
    lowerIsBetter(match) ? a.total - b.total : b.total - a.total
  );

  const ranks = {};
  sorted.forEach((player, index) => {
    const tied = index > 0 && player.total === sorted[index - 1].total;
    ranks[player.id] = tied ? ranks[sorted[index - 1].id] : index + 1;
  });
  return ranks;
}

// Jugador que va ganando, o null si hay empate en cabeza
export function uniqueLeader(match) {
  const ranks = rankPlayers(match);
  const leaders = match.players.filter((player) => ranks[player.id] === 1);
  return leaders.length === 1 ? leaders[0].id : null;
}

// En "menos puntos gana", quien pasa del límite queda eliminado
export function isEliminated(match, player) {
  return match.winMode === "min" && match.scoreLimit !== null && player.total > match.scoreLimit;
}

// ¿El ganador sale solo de los puntos o hay que preguntarlo?
export function needsWinnerChoice(match) {
  return match.winMode === "rounds" || uniqueLeader(match) === null;
}
