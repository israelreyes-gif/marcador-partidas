// Consultas a D1 sobre las rondas (los puntos de cada jugador en cada ronda)

function touchMatch(db, matchId) {
  return db
    .prepare("UPDATE matches SET updated_at = datetime('now') WHERE id = ?")
    .bind(matchId);
}

function lastRoundNumber(db, matchId) {
  return db
    .prepare(
      "SELECT COALESCE(MAX(round_number), 0) AS n FROM scores WHERE match_id = ?"
    )
    .bind(matchId)
    .first()
    .then((row) => row.n);
}

export async function getPlayerIds(db, matchId) {
  const { results } = await db
    .prepare("SELECT id FROM players WHERE match_id = ? ORDER BY position")
    .bind(matchId)
    .all();
  return results.map((player) => player.id);
}

// Añade una ronda nueva al final y devuelve su número
export async function addRound(db, matchId, scores) {
  const number = (await lastRoundNumber(db, matchId)) + 1;

  const inserts = Object.entries(scores).map(([playerId, points]) =>
    db
      .prepare(
        `INSERT INTO scores (match_id, round_number, player_id, points)
         VALUES (?, ?, ?, ?)`
      )
      .bind(matchId, number, Number(playerId), points)
  );

  await db.batch([...inserts, touchMatch(db, matchId)]);
  return number;
}

// Corrige los puntos de una ronda que ya existe. Devuelve false si no existe.
export async function updateRound(db, matchId, number, scores) {
  const exists = await db
    .prepare("SELECT 1 AS found FROM scores WHERE match_id = ? AND round_number = ? LIMIT 1")
    .bind(matchId, number)
    .first();
  if (!exists) return false;

  const updates = Object.entries(scores).map(([playerId, points]) =>
    db
      .prepare(
        `UPDATE scores SET points = ?
          WHERE match_id = ? AND round_number = ? AND player_id = ?`
      )
      .bind(points, matchId, number, Number(playerId))
  );

  await db.batch([...updates, touchMatch(db, matchId)]);
  return true;
}

// Borra la última ronda. Devuelve su número, o null si no había ninguna.
export async function deleteLastRound(db, matchId) {
  const number = await lastRoundNumber(db, matchId);
  if (number === 0) return null;

  await db.batch([
    db
      .prepare("DELETE FROM scores WHERE match_id = ? AND round_number = ?")
      .bind(matchId, number),
    touchMatch(db, matchId),
  ]);
  return number;
}
