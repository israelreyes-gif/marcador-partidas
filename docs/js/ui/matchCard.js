import { h } from "./dom.js";
import { timeAgo } from "./timeAgo.js";

// Tarjeta de una partida en las listas. Lleva a su marcador.
export function matchCard(summary) {
  const link = `#/partida/${summary.id}`;
  const arrow = h("div", { class: "game-arrow", "aria-hidden": "true" }, "›");

  if (summary.locked) {
    return h(
      "a",
      { class: "match-card", href: link },
      h("div", { class: "match-card-main" },
        h("div", { class: "match-card-title" }, "Partida privada"),
        h("div", { class: "match-card-meta" }, `Código ${summary.id} · hace falta la contraseña`)
      ),
      arrow
    );
  }

  const winner = summary.players.find((player) => player.id === summary.winnerPlayerId);
  const status =
    summary.status === "finished"
      ? winner ? `Ganó ${winner.name}` : "Terminada"
      : `En curso · ronda ${summary.roundCount + 1}`;

  return h(
    "a",
    { class: "match-card", href: link },
    h("div", { class: "match-card-main" },
      h("div", { class: "match-card-title" }, summary.game.name),
      h("div", { class: "match-card-players" }, summary.players.map((p) => `${p.name} ${p.total}`).join(" · ")),
      h("div", { class: "match-card-meta" }, `${status} · ${timeAgo(summary.updatedAt)}`)
    ),
    arrow
  );
}
