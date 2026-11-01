import { h } from "./dom.js";
import { textBlocks, scoringTable } from "./textBlocks.js";

const TABS = [
  { id: "rules", label: "Reglas", render: (game) => textBlocks(game.rules ?? "") },
  { id: "how", label: "Cómo se juega", render: (game) => textBlocks(game.how_to_play ?? "") },
  { id: "scoring", label: "Puntuación", render: (game) => scoringTable(game.scoring ?? "") },
];

// Reglas, cómo se juega y puntuación de un juego, en pestañas (solo lectura)
export function rulesTabs(game) {
  let active = TABS[0].id;
  const tabBar = h("div", { class: "tabs", role: "tablist" });
  const content = h("div", { class: "tab-content" });

  function draw() {
    tabBar.replaceChildren(
      ...TABS.map((tab) =>
        h(
          "button",
          {
            type: "button",
            role: "tab",
            class: "tab",
            "aria-pressed": String(tab.id === active),
            onclick: () => {
              active = tab.id;
              draw();
            },
          },
          tab.label
        )
      )
    );
    const blocks = TABS.find((tab) => tab.id === active).render(game);
    content.replaceChildren(
      ...(blocks.length ? blocks : [h("p", { class: "muted" }, "Este juego todavía no tiene esta información.")])
    );
  }

  draw();
  return h("div", { class: "stack-sm" }, tabBar, content);
}
