import { h } from "./dom.js";

const percent = (won, played) => (played === 0 ? 0 : Math.round((won / played) * 100));

function tile(value, label) {
  return h("div", { class: "stat-tile" }, h("div", { class: "stat-value" }, String(value)), h("div", { class: "stat-label" }, label));
}

function gameRow({ game, played, won }) {
  const rate = percent(won, played);
  return h(
    "div",
    { class: "game-stat" },
    h(
      "div",
      { class: "game-stat-head" },
      h("div", { class: "game-stat-name" }, game.name),
      h("div", { class: "game-stat-rate" }, `${rate}%`)
    ),
    h("div", { class: "game-stat-bar", "aria-hidden": "true" }, h("div", { class: "game-stat-fill", style: `width: ${rate}%` })),
    h("div", { class: "muted game-stat-meta" }, `${played} ${played === 1 ? "jugada" : "jugadas"} · ${won} ${won === 1 ? "ganada" : "ganadas"}`)
  );
}

// Estadísticas de una persona: totales y desglose por juego.
// Solo cuentan las partidas terminadas en las que juega como usuario.
export function statsView(stats) {
  if (stats.played === 0) {
    return h(
      "p",
      { class: "muted" },
      "Todavía no hay partidas terminadas con tu usuario. Al crear una partida, deja tu nombre vinculado a tu cuenta (icono de persona) y termínala para que cuente."
    );
  }

  return h(
    "div",
    { class: "stack" },
    h(
      "div",
      { class: "stat-tiles" },
      tile(stats.played, "Jugadas"),
      tile(stats.won, "Ganadas"),
      tile(`${percent(stats.won, stats.played)}%`, "Victorias")
    ),
    h("div", { class: "section-label" }, "Por juego"),
    h("div", { class: "stack-sm" }, stats.byGame.map(gameRow))
  );
}
