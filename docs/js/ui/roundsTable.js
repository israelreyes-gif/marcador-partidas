import { h } from "./dom.js";

// Historial de rondas, la más reciente arriba.
// Si onEdit existe, tocar una ronda permite corregirla.
export function roundsTable(match, onEdit) {
  if (match.rounds.length === 0) {
    return h("p", { class: "muted" }, "Todavía no hay rondas apuntadas.");
  }

  const grid = `grid-template-columns:36px repeat(${match.players.length},minmax(0,1fr))`;
  const head = h(
    "div",
    { class: "round-row round-head", style: grid },
    h("div", {}, "#"),
    match.players.map((player) =>
      h(
        "div",
        { class: "round-cell", title: player.name },
        h("span", { class: "avatar avatar--tiny", style: `background:${player.color}` }, player.name[0].toUpperCase())
      )
    )
  );

  const rows = [...match.rounds].reverse().map((round) => {
    const cells = [
      h("div", { class: "round-number" }, String(round.number)),
      ...match.players.map((player) => h("div", { class: "round-cell" }, String(round.scores[player.id] ?? 0))),
    ];
    return onEdit
      ? h("button", { type: "button", class: "round-row round-row--tap", style: grid, onclick: () => onEdit(round) }, cells)
      : h("div", { class: "round-row", style: grid }, cells);
  });

  return h("div", { class: "rounds" }, head, rows, onEdit ? h("p", { class: "muted hint" }, "Toca una ronda para corregirla.") : null);
}
