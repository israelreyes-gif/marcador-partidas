import { h } from "./dom.js";
import { getSavedUser } from "../storage/session.js";

// Barra superior, visible en todas las pantallas: quién tiene la sesión iniciada.
// Al tocarla se va a la pantalla de Cuenta.
export function startUserBar(container) {
  function draw() {
    const user = getSavedUser();
    container.replaceChildren(
      user
        ? h(
            "a",
            { class: "userbar-link", href: "#/cuenta", "aria-label": `Sesión iniciada como ${user.displayName}` },
            h("span", { class: "userbar-avatar", "aria-hidden": "true" }, user.displayName.slice(0, 1).toUpperCase()),
            h("span", { class: "userbar-name" }, user.displayName)
          )
        : h("a", { class: "userbar-link userbar-guest", href: "#/cuenta" }, "Sin sesión · Entrar")
    );
  }

  window.addEventListener("marcador:session", draw);
  window.addEventListener("storage", draw); // por si se cambia de sesión desde otra pestaña
  draw();
}
