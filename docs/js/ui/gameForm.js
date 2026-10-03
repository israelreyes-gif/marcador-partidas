import { h } from "./dom.js";
import { stepper } from "./stepper.js";

const DECKS = [
  ["espanola", "Española"],
  ["francesa", "Francesa"],
  ["otra", "Otra"],
];
const WIN_MODES = [
  ["min", "Menos puntos"],
  ["max", "Más puntos"],
  ["rounds", "Por rondas"],
];
const PLAYERS_MIN = 2;
const PLAYERS_MAX = 8;
const LIMIT_STEP = 10;
const DEFAULT_LIMIT = 100;

function segmented(options, getValue, setValue) {
  const bar = h("div", { class: "segmented" });
  function draw() {
    bar.replaceChildren(
      ...options.map(([value, label]) =>
        h(
          "button",
          {
            type: "button",
            "aria-pressed": String(getValue() === value),
            onclick: () => {
              setValue(value);
              draw();
            },
          },
          label
        )
      )
    );
  }
  draw();
  return bar;
}

function textField({ label, hint, value, placeholder }) {
  const area = h("textarea", { class: "textarea", rows: "6", maxlength: "5000", placeholder, "aria-label": label });
  area.value = value;
  return { area, element: h("div", { class: "stack-sm" }, h("div", { class: "section-label" }, label), area, h("p", { class: "muted hint" }, hint)) };
}

// Formulario para crear o editar un juego propio.
//   initial: datos actuales del juego (los de la API, en snake_case) o null si es nuevo
//   onSubmit(data): se llama con los datos listos para enviar; si lanza error, se muestra
export function gameForm({ initial = null, submitLabel, onSubmit }) {
  let deck = initial?.deck ?? "espanola";
  let winMode = initial?.win_mode ?? "min";
  let hasLimit = initial ? initial.score_limit !== null : false;

  const name = h("input", {
    type: "text",
    class: "input",
    maxlength: "40",
    placeholder: "Nombre del juego",
    "aria-label": "Nombre del juego",
    value: initial?.name ?? "",
  });

  // Mínimo y máximo de jugadores: el mínimo nunca pasa del máximo
  const minPlayers = stepper({
    label: "Mínimo de jugadores",
    value: initial?.min_players ?? 2,
    min: PLAYERS_MIN,
    max: PLAYERS_MAX,
    onChange: (value) => maxPlayers.getValue() < value && maxPlayers.setValue(value),
  });
  const maxPlayers = stepper({
    label: "Máximo de jugadores",
    value: initial?.max_players ?? 4,
    min: PLAYERS_MIN,
    max: PLAYERS_MAX,
    onChange: (value) => minPlayers.getValue() > value && minPlayers.setValue(value),
  });

  // Límite de puntos: opcional, y solo si ganan "menos" o "más" puntos
  const limit = stepper({
    label: "Límite de puntos",
    value: initial?.score_limit ?? DEFAULT_LIMIT,
    min: LIMIT_STEP,
    max: 1000,
    step: LIMIT_STEP,
  });
  const limitBox = h("input", { type: "checkbox", id: "limit-box" });
  limitBox.checked = hasLimit;
  limitBox.addEventListener("change", () => {
    hasLimit = limitBox.checked;
    drawLimit();
  });
  const limitSection = h(
    "div",
    { class: "stack-sm" },
    h("label", { class: "check", for: "limit-box" }, limitBox, "Tiene un límite de puntos (se elimina o termina al pasarlo)"),
    limit.element
  );
  function drawLimit() {
    limitSection.hidden = winMode === "rounds";
    limit.element.hidden = !hasLimit;
  }

  const modeBar = segmented(WIN_MODES, () => winMode, (value) => {
    winMode = value;
    drawLimit();
  });
  const deckBar = segmented(DECKS, () => deck, (value) => (deck = value));
  drawLimit();

  const rules = textField({
    label: "Reglas",
    hint: "Separa los párrafos con una línea en blanco. Una línea que empiece por «- » forma una lista.",
    value: initial?.rules ?? "",
    placeholder: "Cómo se prepara la partida, objetivo del juego…",
  });
  const how = textField({
    label: "Cómo se juega",
    hint: "Mismo formato: párrafos separados por una línea en blanco y listas con «- ».",
    value: initial?.how_to_play ?? "",
    placeholder: "Qué hace cada jugador en su turno…",
  });
  const scoring = textField({
    label: "Puntuación",
    hint: "Una línea por concepto con el formato «Concepto | Valor». Las líneas sin «|» salen como nota.",
    value: initial?.scoring ?? "",
    placeholder: "Carta alta | 1 punto",
  });

  const message = h("p", { class: "error", role: "alert" });
  const submit = h("button", { type: "submit", class: "btn" }, submitLabel);

  async function handleSubmit(event) {
    event.preventDefault();
    message.textContent = "";
    if (name.value.trim().length < 2) {
      message.textContent = "Ponle un nombre al juego (mínimo 2 letras)";
      return;
    }

    submit.disabled = true;
    try {
      await onSubmit({
        name: name.value.trim(),
        minPlayers: minPlayers.getValue(),
        maxPlayers: maxPlayers.getValue(),
        deck,
        winMode,
        scoreLimit: winMode !== "rounds" && hasLimit ? limit.getValue() : null,
        rules: rules.area.value,
        howToPlay: how.area.value,
        scoring: scoring.area.value,
      });
    } catch (err) {
      message.textContent = err.message;
      submit.disabled = false;
    }
  }

  return h(
    "form",
    { class: "stack", novalidate: true, onsubmit: handleSubmit },
    h("div", { class: "section-label" }, "Nombre"),
    name,
    h("div", { class: "section-label" }, "Baraja"),
    deckBar,
    h("div", { class: "section-label" }, "Jugadores"),
    h("div", { class: "stack-sm" }, minPlayers.element, maxPlayers.element),
    h("div", { class: "section-label" }, "Gana quien tenga"),
    modeBar,
    limitSection,
    rules.element,
    how.element,
    scoring.element,
    message,
    submit
  );
}
