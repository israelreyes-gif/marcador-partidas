// Sesión del usuario en este móvil: el código de sesión y los datos básicos.
// Se guarda en localStorage (no sale del móvil, salvo el código que se envía
// al servidor para demostrar quién eres).

const KEY = "marcador.session";

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return data && typeof data.token === "string" && data.user ? data : null;
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ token, user }));
  } catch {
    // sin almacenamiento disponible (modo privado...): la sesión dura hasta cerrar la app
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nada que borrar
  }
}

export const getToken = () => read()?.token ?? null;
export const getSavedUser = () => read()?.user ?? null;
