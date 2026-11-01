// Guarda las reglas propias de una partida (null = sin reglas propias)
export function setCustomRules(db, id, text) {
  return db
    .prepare("UPDATE matches SET custom_rules = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(text, id)
    .run();
}
