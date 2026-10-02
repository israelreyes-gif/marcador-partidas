import { h } from "./dom.js";
import { rankPlayers, isEliminated } from "../logic/standings.js";

// Tarjetas con el total de cada jugador, su puesto y una barra de progreso
export function scoreboard(match) {
  const ranks = rankPlayers(match);
  const started = match.rounds.length > 0;
  const maxTotal = Math.max(1, ...match.players.map((p) => Math.abs(p.total)));
  const columns = Math.min(match.players.length, 4);

  return h(
    "div",
    { class: "scoreboard", style: `grid-template-columns:repeat(${columns},minmax(0,1fr))` },
    match.players.map((player) => {
      const isWinner = match.winnerPlayerId === player.id;
      const isLeader = started && ranks[player.id] === 1;
      const eliminated = isEliminated(match, player);
      const reference = match.scoreLimit ?? maxTotal;
      const width = Math.max(0, Math.min(100, (player.total / reference) * 100));

      let caption = started ? `${ranks[player.id]}.º` : "";
      if (eliminated) caption = "Fuera";
      if (isWinner) caption = "Ganador";

      return h(
        "div",
        { class: `player-card${isLeader || isWinner ? " is-leader" : ""}${eliminated ? " is-out" : ""}` },
        h("div", { class: "avatar avatar--small", style: `background:${player.color}` }, player.name[0].toUpperCase()),
        h("div", { class: "player-name" }, player.name),
        h("div", { class: "player-total" }, String(player.total)),
        h("div", { class: "bar" }, h("div", { class: "bar-fill", style: `width:${width}%;background:${player.color}` })),
        h("div", { class: "player-caption" }, caption)
      );
    })
  );
}
