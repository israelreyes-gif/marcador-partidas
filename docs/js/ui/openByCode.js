import { h } from "./dom.js";
import { navigate } from "../router.js";

// Extrae el código de 6 caracteres de lo que se escriba o pegue
// (el código solo, o el enlace completo de la partida).
function extractCode(text) {
  const match = text.trim().toUpperCase().match(/([A-Z0-9]{6})\/?$/);
  return match ? match[1] : null;
}

// Formulario para abrir una partida con su código o su enlace
export function openByCodeForm() {
  const input = h("input", {
    type: "text",
    class: "input code-input",
    placeholder: "Código o enlace",
    autocapitalize: "characters",
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": "Código de la partida",
  });
  const message = h("p", { class: "error", role: "alert" });

  return h(
    "form",
    {
      class: "stack-sm",
      novalidate: true,
      onsubmit: (event) => {
        event.preventDefault();
        const code = extractCode(input.value);
        if (!code) {
          message.textContent = "Escribe el código de 6 caracteres o pega el enlace";
          return;
        }
        navigate(`/partida/${code}`);
      },
    },
    h("div", { class: "code-row" }, input, h("button", { type: "submit", class: "btn code-btn" }, "Abrir")),
    message
  );
}
