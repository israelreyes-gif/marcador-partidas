import { h } from "./dom.js";

const MAX_LENGTH = 5000;

// Formulario para escribir las reglas de esta partida.
//  - initial: texto actual
//  - gameRules: texto de las reglas del juego (para el botón "Partir de las del juego")
//  - onSubmit(text): guarda; si falla, el error se muestra en el formulario
//  - onCancel: cierra el formulario sin guardar
export function customRulesForm({ initial = "", gameRules = "", onSubmit, onCancel }) {
  const area = h("textarea", {
    class: "textarea",
    rows: "8",
    maxlength: String(MAX_LENGTH),
    placeholder: "Por ejemplo: aquí el 3 vale 10 puntos y se gana a 50.",
    "aria-label": "Reglas de esta partida",
  });
  area.value = initial;

  const message = h("p", { class: "error", role: "alert" });
  const save = h("button", { type: "submit", class: "btn" }, "Guardar reglas");

  const copy = gameRules.trim()
    ? h(
        "button",
        {
          type: "button",
          class: "btn-text",
          onclick: () => {
            if (area.value.trim() && !confirm("Se sustituirá lo que has escrito. ¿Continuar?")) return;
            area.value = gameRules.trim();
            area.focus();
          },
        },
        "Partir de las reglas del juego"
      )
    : null;

  async function handleSubmit(event) {
    event.preventDefault();
    message.textContent = "";
    save.disabled = true;
    try {
      await onSubmit(area.value);
    } catch (err) {
      message.textContent = err.message;
      save.disabled = false;
    }
  }

  return h(
    "form",
    { class: "stack-sm", onsubmit: handleSubmit, novalidate: true },
    h("p", { class: "muted rules-hint" }, "Solo valen para esta partida. Si lo dejas vacío, se juega con las reglas del juego."),
    area,
    copy,
    message,
    save,
    h("button", { type: "button", class: "btn btn-secondary", onclick: onCancel }, "Cancelar")
  );
}
