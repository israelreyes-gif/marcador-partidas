import { json } from "../lib/response.js";
import { HttpError } from "../lib/errors.js";
import { readJson } from "../lib/request.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { newSessionToken, hashToken } from "../lib/session.js";
import { parseRegistration, parseLogin } from "../lib/userInput.js";
import { readToken, requireUser } from "../lib/auth.js";
import {
  createUser,
  getUserByUsername,
  getUserById,
  publicUser,
  createSession,
  deleteSession,
} from "../db/users.js";

// Abre una sesión nueva y devuelve el código que el móvil guardará
async function startSession(env, userRow, status = 200) {
  const token = newSessionToken();
  await createSession(env.DB, userRow.id, await hashToken(token));
  return json({ token, user: publicUser(userRow) }, status);
}

export function registerAuth(router) {
  // Crear cuenta (y entrar directamente)
  router.add("POST", "/api/auth/register", async ({ request, env }) => {
    const input = parseRegistration(await readJson(request));

    if (await getUserByUsername(env.DB, input.username)) {
      throw new HttpError(409, "Ese usuario ya existe");
    }
    const passwordData = await hashPassword(input.password);

    let id;
    try {
      id = await createUser(env.DB, { ...input, passwordData });
    } catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(409, "Ese usuario ya existe");
      throw err;
    }
    return startSession(env, await getUserById(env.DB, id), 201);
  });

  // Iniciar sesión
  router.add("POST", "/api/auth/login", async ({ request, env }) => {
    const input = parseLogin(await readJson(request));
    const user = await getUserByUsername(env.DB, input.username);

    const valid = user && (await verifyPassword(input.password, user.password_hash, user.password_salt));
    if (!valid) throw new HttpError(401, "Usuario o contraseña incorrectos");

    return startSession(env, user);
  });

  // Quién soy (sirve para saber si la sesión guardada sigue siendo válida)
  router.add("GET", "/api/auth/me", async ({ request, env }) => {
    const user = await requireUser(request, env);
    return json({ user: publicUser(user) });
  });

  // Cerrar sesión en este móvil
  router.add("POST", "/api/auth/logout", async ({ request, env }) => {
    const token = readToken(request);
    if (token) await deleteSession(env.DB, await hashToken(token));
    return json({ ok: true });
  });
}
