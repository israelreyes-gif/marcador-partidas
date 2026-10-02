import { HttpError } from "./errors.js";
import { verifyPassword } from "./password.js";

// La contraseña llega en la cabecera X-Match-Password
async function passwordMatches(request, match) {
  if (!match.password_hash) return false;
  const password = request.headers.get("X-Match-Password") ?? "";
  return verifyPassword(password, match.password_hash, match.password_salt);
}

// Se puede editar si la partida no tiene contraseña o si se aporta la correcta
export async function canEdit(request, match) {
  return !match.password_hash || (await passwordMatches(request, match));
}

// Ver es libre, salvo que la partida sea privada
export async function requireView(request, match) {
  if (match.is_private && !(await passwordMatches(request, match))) {
    throw new HttpError(401, "Esta partida es privada: falta la contraseña");
  }
}

export async function requireEdit(request, match) {
  if (!(await canEdit(request, match))) {
    throw new HttpError(401, "Contraseña incorrecta");
  }
}
