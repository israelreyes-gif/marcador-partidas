import { h } from "./dom.js";
import { openSheet } from "./sheet.js";

// Pregunta quién ha ganado. Devuelve:
//   { id }  -> el jugador elegido
//   { id: undefined } -> "sin ganador"
//   null -> se ha cancelado
export function pickWinner(players) {
  return new Promise((resolve) => {
    let answer = null;
    const choose = (id) => {
      answer = { id };
      close();
    };

    const content = h(
      "div",
      { class: "stack-sm" },
      h("p", { class: "muted" }, "Los puntos no deciden un ganador único. Elige quién ha ganado."),
      players.map((player) =>
        h(
          "button",
          { type: "button", class: "pick-row", onclick: () => choose(player.id) },
          h("span", { class: "dot", style: `background:${player.color}` }),
          player.name
        )
      ),
      h("button", { type: "button", class: "pick-row pick-none", onclick: () => choose(undefined) }, "Sin ganador")
    );
    const close = openSheet(content, { title: "¿Quién ha ganado?", onClose: () => resolve(answer) });
  });
}
