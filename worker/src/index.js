import { createRouter } from "./lib/router.js";
import { error } from "./lib/response.js";
import { HttpError } from "./lib/errors.js";
import { preflight, withCors } from "./lib/cors.js";
import { registerHealth } from "./routes/health.js";
import { registerGames } from "./routes/games.js";
import { registerMatches } from "./routes/matches.js";
import { registerRounds } from "./routes/rounds.js";
import { registerMatchActions } from "./routes/matchActions.js";
import { registerMatchList } from "./routes/matchList.js";

const router = createRouter();
registerHealth(router);
registerGames(router);
registerMatches(router);
registerRounds(router);
registerMatchActions(router);
registerMatchList(router);

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return preflight(env);

    try {
      const response = await router.handle(request, env, ctx);
      return withCors(response ?? error("No encontrado", 404), env);
    } catch (err) {
      if (err instanceof HttpError) {
        return withCors(error(err.message, err.status), env);
      }
      console.error(err);
      return withCors(error("Error interno", 500), env);
    }
  },
};
