const SESSION_DAYS = 90;

export async function createUser(db, { username, displayName, passwordData }) {
  const result = await db
    .prepare("INSERT INTO users (username, display_name, password_hash, password_salt) VALUES (?, ?, ?, ?)")
    .bind(username, displayName, passwordData.hash, passwordData.salt)
    .run();
  return result.meta.last_row_id;
}

export function getUserByUsername(db, username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
}

export function getUserById(db, id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
}

// Lo único del usuario que se envía al cliente (nunca la contraseña)
export function publicUser(row) {
  return { id: row.id, username: row.username, displayName: row.display_name };
}

export async function createSession(db, userId, tokenHash) {
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')"), // limpieza
    db
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, datetime('now', ?))")
      .bind(tokenHash, userId, `+${SESSION_DAYS} days`),
  ]);
}

// Usuario dueño de una sesión que no ha caducado (o null)
export function getUserBySession(db, tokenHash) {
  return db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > datetime('now')`
    )
    .bind(tokenHash)
    .first();
}

export function deleteSession(db, tokenHash) {
  return db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

// Usuarios cuyo nombre de usuario empieza por el texto escrito (para elegirlos en una partida)
export async function searchUsers(db, text, limit = 8) {
  const escaped = text.toLowerCase().replace(/[\\%_]/g, (char) => "\\" + char);
  const { results } = await db
    .prepare("SELECT * FROM users WHERE username LIKE ? ESCAPE '\\' ORDER BY username LIMIT ?")
    .bind(escaped + "%", limit)
    .all();
  return results;
}

export async function getUsersByIds(db, ids) {
  if (ids.length === 0) return [];
  const marks = ids.map(() => "?").join(",");
  const { results } = await db.prepare(`SELECT * FROM users WHERE id IN (${marks})`).bind(...ids).all();
  return results;
}
