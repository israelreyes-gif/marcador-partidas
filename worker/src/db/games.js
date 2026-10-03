// Consultas a D1 sobre el catálogo de juegos
const LIST_FIELDS =
  "g.id, g.name, g.min_players, g.max_players, g.deck, g.win_mode, g.score_limit, g.is_builtin, " +
  "g.owner_user_id, u.display_name AS owner_name";

export async function listGames(db, { deck, q }) {
  const where = [];
  const params = [];

  if (deck) {
    where.push("g.deck = ?");
    params.push(deck);
  }
  if (q) {
    where.push("g.name LIKE ?");
    params.push(`%${q}%`);
  }

  const sql =
    `SELECT ${LIST_FIELDS} FROM games g LEFT JOIN users u ON u.id = g.owner_user_id` +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    " ORDER BY g.is_builtin DESC, g.name COLLATE NOCASE";

  const { results } = await db.prepare(sql).bind(...params).all();
  return results;
}

// Fila del juego tal cual (la usan las partidas)
export async function getGame(db, id) {
  return db.prepare("SELECT * FROM games WHERE id = ?").bind(id).first();
}

// Juego completo con el nombre de quien lo creó (para enseñarlo)
export async function getGameDetail(db, id) {
  return db
    .prepare(
      `SELECT g.*, u.display_name AS owner_name
         FROM games g LEFT JOIN users u ON u.id = g.owner_user_id
        WHERE g.id = ?`
    )
    .bind(id)
    .first();
}

// ¿Hay otro juego con este nombre? (sin distinguir mayúsculas)
export function findGameByName(db, name, exceptId = 0) {
  return db
    .prepare("SELECT id FROM games WHERE name = ? COLLATE NOCASE AND id != ?")
    .bind(name, exceptId)
    .first();
}

export async function createGame(db, input, ownerUserId) {
  const result = await db
    .prepare(
      `INSERT INTO games
         (name, min_players, max_players, deck, win_mode, score_limit, rules, how_to_play, scoring, is_builtin, owner_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`
    )
    .bind(
      input.name,
      input.minPlayers,
      input.maxPlayers,
      input.deck,
      input.winMode,
      input.scoreLimit,
      input.rules,
      input.howToPlay,
      input.scoring,
      ownerUserId
    )
    .run();
  return result.meta.last_row_id;
}

export function updateGame(db, id, input) {
  return db
    .prepare(
      `UPDATE games
          SET name = ?, min_players = ?, max_players = ?, deck = ?, win_mode = ?,
              score_limit = ?, rules = ?, how_to_play = ?, scoring = ?
        WHERE id = ?`
    )
    .bind(
      input.name,
      input.minPlayers,
      input.maxPlayers,
      input.deck,
      input.winMode,
      input.scoreLimit,
      input.rules,
      input.howToPlay,
      input.scoring,
      id
    )
    .run();
}

export async function countGameMatches(db, id) {
  const row = await db.prepare("SELECT COUNT(*) AS total FROM matches WHERE game_id = ?").bind(id).first();
  return row.total;
}

export function deleteGame(db, id) {
  return db.prepare("DELETE FROM games WHERE id = ?").bind(id).run();
}
