// Partidas guardadas en este móvil: su código y, si la hay, su contraseña.
// Así se pueden recuperar las partidas a medias sin tener que escribir nada.
// Se guarda en localStorage del navegador (no sale del móvil).

const KEY = "marcador.matches";

function readAll() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // sin almacenamiento disponible (modo privado...): la app sigue funcionando
  }
}

// Códigos guardados, del más reciente al más antiguo
export function listSavedMatches() {
  return readAll();
}

// Guarda (o actualiza) una partida; la más reciente pasa a la primera posición
export function saveMatch(id, password = null) {
  const others = readAll().filter((item) => item.id !== id);
  const previous = readAll().find((item) => item.id === id);
  writeAll([{ id, password: password ?? previous?.password ?? null }, ...others]);
}

export function getSavedPassword(id) {
  return readAll().find((item) => item.id === id)?.password ?? null;
}

export function forgetMatch(id) {
  writeAll(readAll().filter((item) => item.id !== id));
}
