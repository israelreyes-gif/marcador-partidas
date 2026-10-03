import { HttpError } from "./errors.js";
import { hashToken } from "./session.js";
import { getUserBySession } from "../db/users.js";

// El móvil envía el código de sesión en la cabecera  Authorization: Bearer <código>
export function readToken(request) {
  const header = request.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

// Usuario que ha iniciado sesión, o null si es un visitante
export async function getCurrentUser(request, env) {
  const token = readToken(request);
  if (!token) return null;
  return getUserBySession(env.DB, await hashToken(token));
}

export async function requireUser(request, env) {
  const user = await getCurrentUser(request, env);
  if (!user) throw new HttpError(401, "Tienes que iniciar sesión");
  return user;
}
