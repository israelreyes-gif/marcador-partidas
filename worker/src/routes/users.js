import { json } from "../lib/response.js";
import { requireUser } from "../lib/auth.js";
import { searchUsers, publicUser } from "../db/users.js";

export function registerUsers(router) {
  // Buscar usuarios por el principio de su nombre (para añadirlos a una partida)
  router.add("GET", "/api/users", async ({ request, env, url }) => {
    await requireUser(request, env);

    const text = (url.searchParams.get("q") ?? "").trim().slice(0, 20);
    if (!text) return json({ users: [] });

    const rows = await searchUsers(env.DB, text);
    return json({ users: rows.map(publicUser) });
  });
}
