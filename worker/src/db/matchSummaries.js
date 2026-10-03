// Resumen de varias partidas a la vez, para la pantalla "Mis partidas".
// Usa 3 consultas en total, sin importar cuántas partidas se pidan.

// Códigos de las partidas de un usuario (las que creó o en las que juega),
// de la más reciente a la más antigua
export async function listUserMatchCodes(db, userId, limit = 50) {
  const { results } = await db
    .prepare(
      `SELECT id FROM matches
        WHERE created_by_user_id = ?1
           OR id IN (SELECT match_id FROM players WHERE user_id = ?1)
        ORDER BY updated_at DESC, created_at DESC
        LIMIT ?2`
    )
    .bind(userId, limit)
    .all();
  return results.map((row) => row.id);
}

export async function listMatchSummaries(db, codes) {
  if (codes.length === 0) return [];
  const marks = codes.map(() => "?").join(",");

  const [matchesResult, playersResult, roundsResult] = await db.batch([
    db
      .prepare(
        `SELECT m.id, m.status, m.is_private, m.password_hash, m.winner_player_id,
                m.created_at, m.updated_at, m.finished_at, g.id AS game_id, g.name AS game_name
           FROM matches m JOIN games g ON g.id = m.game_id
          WHERE m.id IN (${marks})`
      )
      .bind(...codes),
    db
      .prepare(
        `SELECT p.match_id, p.id, p.name, p.color, p.position,
                COALESCE(SUM(s.points), 0) AS total
           FROM players p LEFT JOIN scores s ON s.player_id = p.id
          WHERE p.match_id IN (${marks})
          GROUP BY p.id
          ORDER BY p.match_id, p.position`
      )
      .bind(...codes),
    db
      .prepare(
        `SELECT match_id, MAX(round_number) AS rounds
           FROM scores WHERE match_id IN (${marks}) GROUP BY match_id`
      )
      .bind(...codes),
  ]);

  const roundsByMatch = new Map(roundsResult.results.map((r) => [r.match_id, r.rounds]));
  const playersByMatch = new Map();
  for (const player of playersResult.results) {
    const { match_id, ...rest } = player;
    if (!playersByMatch.has(match_id)) playersByMatch.set(match_id, []);
    playersByMatch.get(match_id).push(rest);
  }

  const byId = new Map(matchesResult.results.map((m) => [m.id, m]));
  // Mantiene el orden en que se pidieron los códigos
  return codes
    .filter((code) => byId.has(code))
    .map((code) => {
      const m = byId.get(code);
      // Las privadas no enseñan nada sin contraseña
      if (m.is_private === 1) {
        return { id: m.id, isPrivate: true, locked: true };
      }
      return {
        id: m.id,
        status: m.status,
        game: { id: m.game_id, name: m.game_name },
        isPrivate: false,
        locked: false,
        hasPassword: m.password_hash !== null,
        winnerPlayerId: m.winner_player_id,
        roundCount: roundsByMatch.get(m.id) ?? 0,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        finishedAt: m.finished_at,
        players: playersByMatch.get(m.id) ?? [],
      };
    });
}
