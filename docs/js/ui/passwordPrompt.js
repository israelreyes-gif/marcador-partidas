import { h } from "./dom.js";
import { openSheet } from "./sheet.js";

// Pide la contraseña de una partida. Devuelve la contraseña escrita o null si se cancela.
export function askPassword(message) {
  return new Promise((resolve) => {
    let answer = null;
    const input = h("input", {
      type: "password",
      class: "input",
      placeholder: "Contraseña",
      maxlength: "64",
      autocomplete: "current-password",
      "aria-label": "Contraseña de la partida",
    });
    const form = h(
      "form",
      {
        class: "stack",
        onsubmit: (event) => {
          event.preventDefault();
          if (!input.value) return;
          answer = input.value;
          close();
        },
      },
      h("p", { class: "muted" }, message),
      input,
      h("button", { type: "submit", class: "btn" }, "Aceptar")
    );
    const close = openSheet(form, { title: "Contraseña", onClose: () => resolve(answer) });
    input.focus();
  });
}
