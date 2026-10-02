import { h } from "../ui/dom.js";

export async function notFoundScreen() {
  return h(
    "section",
    {},
    h("h1", {}, "No encontrado"),
    h("p", { class: "muted" }, "Esta pantalla no existe."),
    h("a", { href: "#/", class: "btn" }, "Ir al inicio")
  );
}
