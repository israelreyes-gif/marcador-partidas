import { h } from "./dom.js";
import { playersLabel, winModeLabel } from "./gameFormat.js";

const SUITS = ["♦", "♠", "♥", "♣"];
const RED_SUITS = ["♦", "♥"];

// Tarjeta de un juego en la lista. Lleva a su pantalla de detalle.
export function gameCard(game) {
  const suit = SUITS[game.id % SUITS.length];
  const suitClass = RED_SUITS.includes(suit) ? "game-suit game-suit--red" : "game-suit";

  return h(
    "a",
    { class: "game-card", href: `#/juego/${game.id}` },
    h("div", { class: suitClass, "aria-hidden": "true" }, suit),
    h(
      "div",
      { class: "game-info" },
      h("div", { class: "game-name" }, game.name),
      h("div", { class: "game-meta" }, `${playersLabel(game)} · ${winModeLabel(game)}`)
    ),
    h("div", { class: "game-arrow", "aria-hidden": "true" }, "›")
  );
}
