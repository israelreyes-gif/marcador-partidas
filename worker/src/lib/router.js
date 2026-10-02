// Router mínimo: rutas con parámetros del tipo /api/matches/:id
export function createRouter() {
  const routes = [];

  return {
    add(method, path, handler) {
      const keys = [];
      const source = path.replace(/:([a-zA-Z]+)/g, (_, key) => {
        keys.push(key);
        return "([^/]+)";
      });
      routes.push({ method, pattern: new RegExp("^" + source + "$"), keys, handler });
    },

    async handle(request, env, ctx) {
      const url = new URL(request.url);

      for (const route of routes) {
        if (route.method !== request.method) continue;
        const match = url.pathname.match(route.pattern);
        if (!match) continue;

        const params = {};
        route.keys.forEach((key, i) => {
          params[key] = decodeURIComponent(match[i + 1]);
        });
        return route.handler({ request, env, ctx, params, url });
      }
      return null;
    },
  };
}
