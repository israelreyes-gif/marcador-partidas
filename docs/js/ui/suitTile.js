import { h } from "./dom.js";

// Icono de cada juego: palos de la baraja española (oros, copas, espadas, bastos)
// o de la francesa (♦ ♠ ♥ ♣). Cada juego tiene siempre el mismo.

const NS = "http://www.w3.org/2000/svg";
const CREAM = "#F4EFE3";

function svg(size, shapes) {
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("viewBox", "0 0 24 24");
  el.setAttribute("width", String(size));
  el.setAttribute("height", String(size));
  el.setAttribute("aria-hidden", "true");
  for (const [tag, attrs] of shapes) {
    const shape = document.createElementNS(NS, tag);
    for (const [name, value] of Object.entries(attrs)) shape.setAttribute(name, value);
    el.append(shape);
  }
  return el;
}

const SPANISH = [
  // oros
  (s) => svg(s, [
    ["circle", { cx: 12, cy: 12, r: 10, fill: "#C98A12" }],
    ["circle", { cx: 12, cy: 12, r: 6.5, fill: CREAM }],
    ["circle", { cx: 12, cy: 12, r: 3.2, fill: "#C98A12" }],
  ]),
  // copas
  (s) => svg(s, [
    ["path", { d: "M4 3h16c0 6.5-3 10-8 10S4 9.5 4 3z", fill: "#C8453B" }],
    ["rect", { x: 10.6, y: 12.5, width: 2.8, height: 6, fill: "#C8453B" }],
    ["rect", { x: 6.5, y: 18.5, width: 11, height: 3, rx: 1.5, fill: "#C8453B" }],
  ]),
  // espadas
  (s) => svg(s, [
    ["path", { d: "M12 1l2.6 4v10h-5.2V5z", fill: "#2F4B7C" }],
    ["rect", { x: 5.5, y: 15, width: 13, height: 2.6, rx: 1.3, fill: "#2F4B7C" }],
    ["rect", { x: 10.8, y: 17.5, width: 2.4, height: 4, fill: "#2F4B7C" }],
    ["circle", { cx: 12, cy: 22, r: 1.6, fill: "#2F4B7C" }],
  ]),
  // bastos
  (s) => svg(s, [
    ["path", { d: "M12 1.5c2.8 0 4 2 3.6 4.2L14 20.5c-.2 1.3-1 2-2 2s-1.8-.7-2-2L8.4 5.7C8 3.5 9.2 1.5 12 1.5z", fill: "#3F7A3B" }],
    ["circle", { cx: 12, cy: 8, r: 1.1, fill: CREAM }],
    ["circle", { cx: 12.3, cy: 13.5, r: 1.1, fill: CREAM }],
  ]),
];

const FRENCH = [
  { glyph: "♦", red: true },
  { glyph: "♠", red: false },
  { glyph: "♥", red: true },
  { glyph: "♣", red: false },
];

// Cuadrado con el icono del juego. big = versión grande (pantalla de detalle).
export function suitTile(game, { big = false } = {}) {
  const base = `game-suit${big ? " game-suit--big" : ""}`;
  const size = big ? 40 : 28;

  if (game.deck === "espanola") {
    return h("div", { class: base, "aria-hidden": "true" }, SPANISH[game.id % SPANISH.length](size));
  }
  if (game.deck === "francesa") {
    const suit = FRENCH[game.id % FRENCH.length];
    return h("div", { class: `${base}${suit.red ? " game-suit--red" : ""}`, "aria-hidden": "true" }, suit.glyph);
  }
  return h("div", { class: base, "aria-hidden": "true" }, "★");
}
