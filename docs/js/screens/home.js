import { h } from "../ui/dom.js";
import { loadMySummaries } from "../logic/mySummaries.js";
import { matchCard } from "../ui/matchCard.js";
import { openByCodeForm } from "../ui/openByCode.js";

const MAX_SHOWN = 3;

// Inicio: nueva partida, partidas en curso y abrir una con su código
export async function homeScreen() {
  const list = h("div", { class: "game-list" }, h("p", { class: "muted" }, "Cargando…"));
  const seeAll = h("a", { href: "#/partidas", class: "back-link", hidden: true }, "Ver todas ›");

  loadMySummaries()
    .then((summaries) => {
      const active = summaries.filter((summary) => summary.locked || summary.status === "active");
      list.replaceChildren(
        ...(active.length
          ? active.slice(0, MAX_SHOWN).map(matchCard)
          : [h("p", { class: "muted" }, "No tienes partidas en curso.")])
      );
      seeAll.hidden = summaries.length === 0;
    })
    .catch((err) => list.replaceChildren(h("p", { class: "error" }, err.message)));

  return h(
    "section",
    { class: "stack" },
    h("div", {}, h("h1", {}, "Marcador"), h("p", { class: "muted" }, "Las puntuaciones de tus partidas de cartas")),
    h("a", { href: "#/juegos", class: "btn" }, "Nueva partida"),
    h("div", { class: "section-head" }, h("div", { class: "section-label" }, "Seguir jugando"), seeAll),
    list,
    h("div", { class: "section-label" }, "Abrir una partida"),
    openByCodeForm()
  );
}
