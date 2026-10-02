// Consultas a D1 sobre el catálogo de juegos
const LIST_FIELDS =
  "id, name, min_players, max_players, deck, win_mode, score_limit, is_builtin";

export async function listGames(db, { deck, mine, q }) {
  const where = [];
  const params = [];

  if (deck) {
    where.push("deck = ?");
    params.push(deck);
  }
  if (mine) {
    where.push("is_builtin = 0");
  }
  if (q) {
    where.push("name LIKE ?");
    params.push(`%${q}%`);
  }

  const sql =
    `SELECT ${LIST_FIELDS} FROM games` +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    " ORDER BY is_builtin DESC, name COLLATE NOCASE";

  const { results } = await db.prepare(sql).bind(...params).all();
  return results;
}

export async function getGame(db, id) {
  return db.prepare("SELECT * FROM games WHERE id = ?").bind(id).first();
}
