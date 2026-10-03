// Estadísticas de un usuario: solo cuentan las partidas TERMINADAS en las que
// juega (vinculado como jugador). Ganar = ser el ganador de la partida.
// Terminar sin ganador cuenta como jugada, no como ganada.

export async function getUserStats(db, userId) {
  const { results } = await db
    .prepare(
      `SELECT m.game_id AS gameId, g.name AS gameName,
              COUNT(*) AS played,
              SUM(CASE WHEN m.winner_player_id = p.id THEN 1 ELSE 0 END) AS won
         FROM players p
         JOIN matches m ON m.id = p.match_id
         JOIN games g ON g.id = m.game_id
        WHERE p.user_id = ? AND m.status = 'finished'
        GROUP BY m.game_id
        ORDER BY played DESC, g.name`
    )
    .bind(userId)
    .all();

  const byGame = results.map((row) => ({
    game: { id: row.gameId, name: row.gameName },
    played: row.played,
    won: row.won,
  }));
  const played = byGame.reduce((sum, row) => sum + row.played, 0);
  const won = byGame.reduce((sum, row) => sum + row.won, 0);

  return { played, won, byGame };
}
