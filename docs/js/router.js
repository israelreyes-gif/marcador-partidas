// Router por "hash": la dirección es index.html#/partida/ABC234
// Funciona en GitHub Pages sin configurar nada en el servidor.

const routes = [];

// path: "/", "/partida/:id"...   screen: async (params) => elemento HTML
export function addRoute(path, screen) {
  const keys = [];
  const source = path.replace(/:([a-zA-Z]+)/g, (_, key) => {
    keys.push(key);
    return "([^/]+)";
  });
  routes.push({ pattern: new RegExp("^" + source + "$"), keys, screen });
}

export function navigate(path) {
  location.hash = "#" + path;
}

export function startRouter(container, notFound) {
  async function show() {
    const path = location.hash.slice(1) || "/";

    for (const route of routes) {
      const match = path.match(route.pattern);
      if (!match) continue;

      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(match[i + 1]);
      });
      container.replaceChildren(await route.screen(params));
      window.scrollTo(0, 0);
      return;
    }
    container.replaceChildren(await notFound());
  }

  window.addEventListener("hashchange", show);
  show();
}
