// Decide quién gana una partida según su modo de victoria.
//  - "min": gana quien tenga menos puntos (Chinchón, Continental...)
//  - "max": gana quien tenga más puntos (Mus...)
//  - "rounds": no se puede deducir de los totales; hay que indicarlo a mano
// Si hay empate devuelve null (se puede indicar el ganador a mano).
export function decideWinner(winMode, players) {
  if (winMode === "rounds" || players.length === 0) return null;

  const best =
    winMode === "min"
      ? Math.min(...players.map((p) => p.total))
      : Math.max(...players.map((p) => p.total));

  const leaders = players.filter((p) => p.total === best);
  return leaders.length === 1 ? leaders[0].id : null;
}
