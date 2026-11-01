// Cambia quién gana en una partida: "min" (menos puntos) o "max" (más puntos)
export function setWinMode(db, id, winMode) {
  return db
    .prepare("UPDATE matches SET win_mode = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(winMode, id)
    .run();
}
