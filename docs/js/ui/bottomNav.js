import { h } from "./dom.js";
import { icon } from "./icons.js";

const TABS = [
  { href: "#/", label: "Inicio", icon: "home", active: (path) => path === "/" },
  {
    href: "#/juegos",
    label: "Juegos",
    icon: "cards",
    active: (path) => path.startsWith("/juego") || path.startsWith("/nueva-partida"),
  },
  {
    href: "#/partidas",
    label: "Partidas",
    icon: "list",
    active: (path) => path === "/partidas" || path.startsWith("/partida/"),
  },
];

// Barra de navegación inferior. Marca la sección en la que estás.
export function startBottomNav(container) {
  const links = TABS.map((tab) =>
    h("a", { class: "nav-link", href: tab.href }, icon(tab.icon), h("span", {}, tab.label))
  );
  container.replaceChildren(...links);

  function update() {
    const path = location.hash.slice(1) || "/";
    TABS.forEach((tab, index) => {
      if (tab.active(path)) links[index].setAttribute("aria-current", "page");
      else links[index].removeAttribute("aria-current");
    });
  }

  window.addEventListener("hashchange", update);
  update();
}
