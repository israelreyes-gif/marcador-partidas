import { h } from "../ui/dom.js";
import { request } from "../api/client.js";
import { textBlocks, scoringTable } from "../ui/textBlocks.js";
import { playersLabel, winModeLabel, deckLabel } from "../ui/gameFormat.js";
import { suitTile } from "../ui/suitTile.js";

const TABS = [
  { id: "rules", label: "Reglas", render: (game) => textBlocks(game.rules) },
  { id: "how", label: "Cómo se juega", render: (game) => textBlocks(game.how_to_play) },
  { id: "scoring", label: "Puntuación", render: (game) => scoringTable(game.scoring) },
];

function backLink() {
  return h("a", { href: "#/juegos", class: "back-link" }, "‹ Juegos de cartas");
}

// Detalle de un juego: reglas, cómo se juega y puntuación
export async function gameDetailScreen({ id }) {
  let game;
  try {
    ({ game } = await request("GET", `/api/games/${encodeURIComponent(id)}`));
  } catch (err) {
    return h("section", { class: "stack" }, backLink(), h("p", { class: "error" }, err.message));
  }

  let activeTab = TABS[0].id;
  const tabBar = h("div", { class: "tabs", role: "tablist" });
  const content = h("div", { class: "tab-content" });

  function drawTabs() {
    tabBar.replaceChildren(
      ...TABS.map((tab) =>
        h(
          "button",
          {
            type: "button",
            role: "tab",
            class: "tab",
            "aria-pressed": String(tab.id === activeTab),
            onclick: () => {
              activeTab = tab.id;
              drawTabs();
            },
          },
          tab.label
        )
      )
    );

    const tab = TABS.find((t) => t.id === activeTab);
    const blocks = tab.render(game);
    content.replaceChildren(
      ...(blocks.length
        ? blocks
        : [h("p", { class: "muted" }, "Este juego todavía no tiene esta información.")])
    );
  }
  drawTabs();

  return h(
    "section",
    { class: "stack" },
    backLink(),
    h("div", { class: "detail-head" }, suitTile(game, { big: true }), h("h1", {}, game.name)),
    h(
      "div",
      { class: "tags" },
      h("span", { class: "tag" }, playersLabel(game)),
      h("span", { class: "tag" }, deckLabel(game)),
      h("span", { class: "tag" }, winModeLabel(game)),
      game.score_limit ? h("span", { class: "tag" }, `Límite ${game.score_limit} puntos`) : null
    ),
    tabBar,
    content,
    h("a", { href: `#/nueva-partida/${game.id}`, class: "btn detail-cta" }, "Nueva partida")
  );
}
