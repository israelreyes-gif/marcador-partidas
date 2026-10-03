import { h } from "../ui/dom.js";
import { request } from "../api/client.js";
import { deleteGame } from "../api/games.js";
import { navigate } from "../router.js";
import { showToast } from "../ui/toast.js";
import { textBlocks, scoringTable } from "../ui/textBlocks.js";
import {
  playersLabel,
  winModeLabel,
  deckLabel,
  suitOf,
  isRedSuit,
} from "../ui/gameFormat.js";

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

  async function onDelete() {
    if (!confirm(`¿Borrar el juego «${game.name}»? No se puede recuperar.`)) return;
    try {
      await deleteGame(game.id);
      showToast("Juego borrado");
      navigate("/juegos");
    } catch (err) {
      showToast(err.message);
    }
  }

  // Solo quien creó el juego ve estas opciones
  const ownerActions = game.isMine
    ? h(
        "div",
        { class: "owner-actions" },
        h("a", { href: `#/juego-editar/${game.id}`, class: "btn btn-secondary" }, "Editar juego"),
        h("button", { type: "button", class: "btn-text btn-text--danger", onclick: onDelete }, "Borrar juego")
      )
    : null;

  const suit = suitOf(game);
  return h(
    "section",
    { class: "stack" },
    backLink(),
    h(
      "div",
      { class: "detail-head" },
      h(
        "div",
        { class: isRedSuit(suit) ? "game-suit game-suit--big game-suit--red" : "game-suit game-suit--big", "aria-hidden": "true" },
        suit
      ),
      h("div", {}, h("h1", {}, game.name), game.ownerName ? h("div", { class: "muted" }, `Creado por ${game.ownerName}`) : null)
    ),
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
    h("a", { href: `#/nueva-partida/${game.id}`, class: "btn detail-cta" }, "Nueva partida"),
    ownerActions
  );
}
