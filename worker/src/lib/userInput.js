import { HttpError } from "./errors.js";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

// Usuario y contraseña tal como llegan en el registro o el inicio de sesión.
// El usuario se guarda en minúsculas (así "Isra" e "isra" son el mismo);
// el nombre que se muestra conserva las mayúsculas que escribió.
export function parseRegistration(body) {
  const typedName = typeof body.username === "string" ? body.username.trim() : "";
  const username = typedName.toLowerCase();
  if (!USERNAME_RE.test(username)) {
    throw new HttpError(400, "El usuario debe tener de 3 a 20 letras, números o _ (sin espacios ni tildes)");
  }
  const password = parsePassword(body.password);
  return { username, displayName: typedName, password };
}

export function parseLogin(body) {
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) throw new HttpError(400, "Escribe tu usuario y tu contraseña");
  return { username, password };
}

function parsePassword(value) {
  if (typeof value !== "string" || value.length < 6 || value.length > 64) {
    throw new HttpError(400, "La contraseña debe tener de 6 a 64 caracteres");
  }
  return value;
}
