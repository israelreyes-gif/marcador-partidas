import { json } from "../lib/response.js";
import { requireUser } from "../lib/auth.js";
import { getUserStats } from "../db/stats.js";

export function registerStats(router) {
  // Mis estadísticas (hace falta sesión)
  router.add("GET", "/api/me/stats", async ({ request, env }) => {
    const user = await requireUser(request, env);
    return json({ stats: await getUserStats(env.DB, user.id) });
  });
}
