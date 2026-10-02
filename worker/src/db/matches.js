import { generateMatchCode } from "../lib/matchCode.js";

// Crea la partida y sus jugadores de una sola vez (todo o nada).
// Si el código generado ya existe, prueba con otro.
export async function createMatch(db, { game, input, passwordData }) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateMatchCode();
    try {
      await db.batch([
        db
          .prepare(
            `INSERT INTO matches
               (id, game_id, win_mode, score_limit, password_hash, password_salt, is_private)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            id,
            game.id,
            input.winMode,
            input.scoreLimit,
            passwordData?.hash ?? null,
            passwordData?.salt ?? null,
            input.isPrivate ? 1 : 0
          ),
        ...input.players.map((player, index) =>
          db
            .prepare(
              "INSERT INTO players (match_id, name, color, position) VALUES (?, ?, ?, ?)"
            )
            .bind(id, player.name, player.color, index + 1)
        ),
      ]);
      return id;
    } catch (err) {
      if (!String(err.message).includes("matches.id")) throw err;
    }
  }
  throw new Error("No se pudo generar un código de partida");
}

// Fila de la partida tal cual está en D1 (incluye la contraseña cifrada)
export function getMatchRow(db, id) {
  return db
    .prepare(
      `SELECT m.*, g.name AS game_name
         FROM matches m JOIN games g ON g.id = m.game_id
        WHERE m.id = ?`
    )
    .bind(id)
    .first();
}

// Partida lista para enviar al cliente: sin contraseña, con jugadores y rondas
export async function getMatchDetail(db, row, canEdit) {
  const [playersResult, scoresResult] = await db.batch([
    db
      .prepare(
        `SELECT p.id, p.name, p.color, p.position,
                COALESCE(SUM(s.points), 0) AS total
           FROM players p LEFT JOIN scores s ON s.player_id = p.id
          WHERE p.match_id = ?
          GROUP BY p.id
          ORDER BY p.position`
      )
      .bind(row.id),
    db
      .prepare(
        `SELECT round_number, player_id, points
           FROM scores WHERE match_id = ? ORDER BY round_number`
      )
      .bind(row.id),
  ]);

  const rounds = [];
  for (const score of scoresResult.results) {
    let round = rounds[rounds.length - 1];
    if (!round || round.number !== score.round_number) {
      round = { number: score.round_number, scores: {} };
      rounds.push(round);
    }
    round.scores[score.player_id] = score.points;
  }

  return {
    id: row.id,
    status: row.status,
    game: { id: row.game_id, name: row.game_name },
    winMode: row.win_mode,
    scoreLimit: row.score_limit,
    isPrivate: row.is_private === 1,
    hasPassword: row.password_hash !== null,
    canEdit,
    winnerPlayerId: row.winner_player_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    finishedAt: row.finished_at,
    players: playersResult.results,
    rounds,
  };
}
