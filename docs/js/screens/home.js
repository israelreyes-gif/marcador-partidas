import { h } from "../ui/dom.js";
import { request } from "../api/client.js";

// Pantalla de inicio (provisional): comprueba que la API responde y
// da acceso a los juegos. Más adelante se completa con las partidas.
export async function homeScreen() {
  const status = h("p", { class: "muted" }, "Conectando con el servidor…");

  request("GET", "/api/health")
    .then((data) => {
      status.textContent = `Servidor conectado · ${data.games} juegos disponibles`;
    })
    .catch((err) => {
      status.textContent = err.message;
      status.className = "error";
    });

  return h(
    "section",
    { class: "stack" },
    h("h1", {}, "Marcador"),
    h("div", { class: "card" }, status),
    h("a", { href: "#/juegos", class: "btn" }, "Juegos de cartas")
  );
}
