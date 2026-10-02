import { h } from "../ui/dom.js";
import { loadMySummaries } from "../logic/mySummaries.js";
import { matchCard } from "../ui/matchCard.js";

const FILTERS = [
  { id: "active", label: "En curso", keep: (m) => m.locked || m.status === "active" },
  { id: "finished", label: "Terminadas", keep: (m) => !m.locked && m.status === "finished" },
];

// Todas las partidas guardadas en este móvil, en curso o terminadas
export async function myMatchesScreen() {
  let summaries = [];
  let filter = FILTERS[0].id;

  const chips = h("div", { class: "chips" });
  const list = h("div", { class: "game-list" }, h("p", { class: "muted" }, "Cargando…"));

  function drawChips() {
    chips.replaceChildren(
      ...FILTERS.map((item) =>
        h(
          "button",
          {
            type: "button",
            class: "chip",
            "aria-pressed": String(item.id === filter),
            onclick: () => {
              filter = item.id;
              draw();
            },
          },
          item.label
        )
      )
    );
  }

  function draw() {
    drawChips();
    const shown = summaries.filter(FILTERS.find((item) => item.id === filter).keep);
    list.replaceChildren(
      ...(shown.length
        ? shown.map(matchCard)
        : [h("p", { class: "muted" }, filter === "active" ? "No tienes partidas en curso." : "Todavía no has terminado ninguna partida.")])
    );
  }

  loadMySummaries()
    .then((result) => {
      summaries = result;
      draw();
    })
    .catch((err) => list.replaceChildren(h("p", { class: "error" }, err.message)));

  drawChips();

  return h("section", { class: "stack" }, h("h1", {}, "Mis partidas"), chips, list);
}
