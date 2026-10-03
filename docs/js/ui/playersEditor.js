import { h } from "./dom.js";
import { icon } from "./icons.js";
import { playerColor } from "./playerColors.js";
import { pickUser } from "./userPicker.js";
import { getSavedUser } from "../storage/session.js";

// Lista editable de jugadores, entre `min` y `max`.
// Cada jugador es un nombre libre o, si has iniciado sesión, un usuario registrado.
// Devuelve { element, getPlayers() } con [{ name, userId? }].
export function playersEditor({ min, max }) {
  const me = getSavedUser();

  // Con sesión iniciada, el primer jugador eres tú (se puede cambiar o quitar el vínculo)
  const players = Array.from({ length: min }, () => ({ name: "", user: null }));
  if (me) players[0] = { name: me.displayName, user: me };

  const rows = h("div", { class: "player-rows" });
  const count = h("div", { class: "section-label" });
  const hint = me
    ? h(
        "p",
        { class: "muted hint" },
        "Toca el icono de persona para elegir a un usuario registrado: la partida contará en sus estadísticas."
      )
    : null;
  const addButton = h(
    "button",
    {
      type: "button",
      class: "btn-dashed",
      onclick: () => {
        players.push({ name: "", user: null });
        draw();
      },
    },
    "+ Añadir jugador"
  );

  async function onLinkClick(player) {
    if (player.user) {
      player.user = null; // se queda el nombre, ya como nombre libre
      draw();
      return;
    }
    const excludeIds = players.map((item) => item.user?.id).filter(Boolean);
    const chosen = await pickUser({ excludeIds });
    if (!chosen) return;
    player.user = chosen;
    player.name = chosen.displayName;
    draw();
  }

  function draw() {
    count.textContent = `Jugadores · ${players.length}`;
    addButton.hidden = players.length >= max;

    rows.replaceChildren(
      ...players.map((player, index) => {
        const avatar = h(
          "div",
          { class: "avatar", style: `background:${playerColor(index)}` },
          (player.name.trim()[0] ?? String(index + 1)).toUpperCase()
        );
        const input = h("input", {
          type: "text",
          class: player.user ? "input input--linked" : "input",
          maxlength: "30",
          value: player.name,
          readonly: player.user !== null,
          placeholder: `Jugador ${index + 1}`,
          "aria-label": `Nombre del jugador ${index + 1}`,
          oninput: (event) => {
            player.name = event.target.value;
            avatar.textContent = (player.name.trim()[0] ?? String(index + 1)).toUpperCase();
          },
        });
        const link = me
          ? h(
              "button",
              {
                type: "button",
                class: player.user ? "icon-btn icon-btn--on" : "icon-btn",
                "aria-label": player.user
                  ? `Quitar el vínculo con @${player.user.username}`
                  : `Elegir un usuario para el jugador ${index + 1}`,
                onclick: () => onLinkClick(player),
              },
              icon("user")
            )
          : null;
        const remove =
          players.length > min
            ? h(
                "button",
                {
                  type: "button",
                  class: "icon-btn",
                  "aria-label": `Quitar al jugador ${index + 1}`,
                  onclick: () => {
                    players.splice(index, 1);
                    draw();
                  },
                },
                "✕"
              )
            : null;
        return h("div", { class: "player-row" }, avatar, input, link, remove);
      })
    );
  }
  draw();

  return {
    element: h("div", { class: "stack-sm" }, count, rows, hint, addButton),
    getPlayers: () =>
      players.map((player) => {
        const name = player.name.trim();
        return player.user ? { name, userId: player.user.id } : { name };
      }),
  };
}
