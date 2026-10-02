import { h } from "./dom.js";

// Formulario para apuntar (o corregir) una ronda: un número por jugador.
// Un campo vacío cuenta como 0. onSubmit recibe { idJugador: puntos }
// y, si falla, el mensaje del error se muestra en el formulario.
export function roundEditorForm({ players, initial = {}, submitLabel, onSubmit }) {
  const inputs = players.map((player) =>
    h("input", {
      type: "number",
      step: "1",
      class: "input score-input",
      placeholder: "0",
      value: initial[player.id] ?? "",
      "aria-label": `Puntos de ${player.name}`,
    })
  );
  const message = h("p", { class: "error", role: "alert" });
  const submit = h("button", { type: "submit", class: "btn" }, submitLabel);

  async function handleSubmit(event) {
    event.preventDefault();
    message.textContent = "";

    const scores = {};
    for (const [index, player] of players.entries()) {
      const raw = inputs[index].value.trim();
      const points = raw === "" ? 0 : Number(raw);
      if (!Number.isInteger(points)) {
        message.textContent = `Los puntos de ${player.name} tienen que ser un número entero`;
        return;
      }
      scores[player.id] = points;
    }

    submit.disabled = true;
    try {
      await onSubmit(scores);
    } catch (err) {
      message.textContent = err.message;
      submit.disabled = false;
    }
  }

  const form = h(
    "form",
    { class: "stack", onsubmit: handleSubmit, novalidate: true },
    players.map((player, index) =>
      h(
        "label",
        { class: "score-field" },
        h("span", { class: "dot", style: `background:${player.color}` }),
        h("span", { class: "score-field-name" }, player.name),
        inputs[index]
      )
    ),
    message,
    submit
  );

  // El primer campo se enfoca al abrirse
  queueMicrotask(() => inputs[0]?.focus());
  return form;
}
