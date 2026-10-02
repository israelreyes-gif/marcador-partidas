import { h } from "./dom.js";
import { playerColor } from "./playerColors.js";

// Lista editable de jugadores, entre `min` y `max`.
// Devuelve { element, getNames() }.
export function playersEditor({ min, max }) {
  const names = Array.from({ length: min }, () => "");
  const rows = h("div", { class: "player-rows" });
  const count = h("div", { class: "section-label" });
  const addButton = h(
    "button",
    {
      type: "button",
      class: "btn-dashed",
      onclick: () => {
        names.push("");
        draw();
      },
    },
    "+ Añadir jugador"
  );

  function draw() {
    count.textContent = `Jugadores · ${names.length}`;
    addButton.hidden = names.length >= max;

    rows.replaceChildren(
      ...names.map((name, index) => {
        const avatar = h(
          "div",
          { class: "avatar", style: `background:${playerColor(index)}` },
          (name.trim()[0] ?? String(index + 1)).toUpperCase()
        );
        const input = h("input", {
          type: "text",
          class: "input",
          maxlength: "30",
          value: name,
          placeholder: `Jugador ${index + 1}`,
          "aria-label": `Nombre del jugador ${index + 1}`,
          oninput: (event) => {
            names[index] = event.target.value;
            avatar.textContent = (names[index].trim()[0] ?? String(index + 1)).toUpperCase();
          },
        });
        const remove =
          names.length > min
            ? h(
                "button",
                {
                  type: "button",
                  class: "icon-btn",
                  "aria-label": `Quitar al jugador ${index + 1}`,
                  onclick: () => {
                    names.splice(index, 1);
                    draw();
                  },
                },
                "✕"
              )
            : null;
        return h("div", { class: "player-row" }, avatar, input, remove);
      })
    );
  }
  draw();

  return {
    element: h("div", { class: "stack-sm" }, count, rows, addButton),
    getNames: () => names.map((name) => name.trim()),
  };
}
