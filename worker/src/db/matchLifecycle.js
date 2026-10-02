// Consultas a D1 para terminar, reabrir y borrar partidas

export async function finishMatch(db, matchId, winnerPlayerId) {
  await db
    .prepare(
      `UPDATE matches
          SET status = 'finished', winner_player_id = ?,
              finished_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?`
    )
    .bind(winnerPlayerId, matchId)
    .run();
}

export async function reopenMatch(db, matchId) {
  await db
    .prepare(
      `UPDATE matches
          SET status = 'active', winner_player_id = NULL,
              finished_at = NULL, updated_at = datetime('now')
        WHERE id = ?`
    )
    .bind(matchId)
    .run();
}

// Borra puntos, jugadores y partida de una sola vez (todo o nada)
export async function deleteMatch(db, matchId) {
  await db.batch([
    db.prepare("DELETE FROM scores WHERE match_id = ?").bind(matchId),
    db.prepare("DELETE FROM players WHERE match_id = ?").bind(matchId),
    db.prepare("DELETE FROM matches WHERE id = ?").bind(matchId),
  ]);
}
