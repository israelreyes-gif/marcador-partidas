import { h } from "../ui/dom.js";
import { request } from "../api/client.js";
import { navigate } from "../router.js";
import { playersEditor } from "../ui/playersEditor.js";
import { saveMatch } from "../storage/myMatches.js";

const LIMIT_STEP = 10;

function backLink(gameId) {
  return h("a", { href: `#/juego/${gameId}`, class: "back-link" }, "‹ Volver al juego");
}

// Formulario para crear una partida de un juego
export async function newMatchScreen({ gameId }) {
  let game;
  try {
    ({ game } = await request("GET", `/api/games/${encodeURIComponent(gameId)}`));
  } catch (err) {
    return h("section", { class: "stack" }, backLink(gameId), h("p", { class: "error" }, err.message));
  }

  const players = playersEditor({ min: game.min_players, max: game.max_players });

  // Quién gana: solo se puede elegir en los juegos de "menos" o "más" puntos
  let winMode = game.win_mode;
  const modeBar = h("div", { class: "segmented" });
  function drawMode() {
    modeBar.replaceChildren(
      ...[
        ["min", "Menos puntos"],
        ["max", "Más puntos"],
      ].map(([value, label]) =>
        h(
          "button",
          {
            type: "button",
            "aria-pressed": String(winMode === value),
            onclick: () => {
              winMode = value;
              drawMode();
            },
          },
          label
        )
      )
    );
  }
  drawMode();

  // Límite de puntos: solo si el juego tiene uno
  let limit = game.score_limit;
  const limitValue = h("div", { class: "stepper-value" }, String(limit));
  function changeLimit(delta) {
    limit = Math.max(LIMIT_STEP, limit + delta);
    limitValue.textContent = String(limit);
  }

  const password = h("input", {
    type: "password",
    class: "input",
    placeholder: "Sin contraseña",
    maxlength: "64",
    autocomplete: "new-password",
    "aria-label": "Contraseña de la partida",
  });
  const privateBox = h("input", { type: "checkbox", id: "private-box" });
  const message = h("p", { class: "error", role: "alert" });
  const submit = h("button", { type: "submit", class: "btn" }, "Empezar partida");

  async function onSubmit(event) {
    event.preventDefault();
    message.textContent = "";

    const names = players.getNames();
    if (names.some((name) => !name)) {
      message.textContent = "Pon un nombre a todos los jugadores";
      return;
    }
    if (privateBox.checked && !password.value) {
      message.textContent = "Una partida privada necesita contraseña";
      return;
    }

    const body = { gameId: game.id, players: names.map((name) => ({ name })) };
    if (game.win_mode !== "rounds") body.winMode = winMode;
    if (game.score_limit !== null) body.scoreLimit = limit;
    if (password.value) body.password = password.value;
    if (privateBox.checked) body.isPrivate = true;

    submit.disabled = true;
    try {
      const { match } = await request("POST", "/api/matches", { body });
      saveMatch(match.id, password.value || null);
      navigate(`/partida/${match.id}`);
    } catch (err) {
      message.textContent = err.message;
      submit.disabled = false;
    }
  }

  return h(
    "form",
    { class: "stack", onsubmit: onSubmit, novalidate: true },
    backLink(game.id),
    h("div", {}, h("h1", {}, "Nueva partida"), h("div", { class: "muted" }, game.name)),
    players.element,

    h("div", { class: "section-label" }, "Ajustes"),
    game.win_mode !== "rounds"
      ? h("div", { class: "stack-sm" }, h("div", {}, "Gana quien tenga"), modeBar)
      : null,
    game.score_limit !== null
      ? h(
          "div",
          { class: "stepper" },
          h("div", {}, "Se elimina al pasar de"),
          h(
            "div",
            { class: "stepper-controls" },
            h("button", { type: "button", "aria-label": "Restar 10 puntos", onclick: () => changeLimit(-LIMIT_STEP) }, "−"),
            limitValue,
            h("button", { type: "button", "aria-label": "Sumar 10 puntos", onclick: () => changeLimit(LIMIT_STEP) }, "+")
          )
        )
      : null,

    h("div", { class: "section-label" }, "Contraseña (opcional)"),
    h(
      "div",
      { class: "stack-sm" },
      password,
      h("p", { class: "muted hint" }, "Sin contraseña, cualquiera con el código puede apuntar puntos. Con contraseña, los demás solo pueden verla."),
      h("label", { class: "check", for: "private-box" }, privateBox, "Privada: también hace falta la contraseña para verla")
    ),

    message,
    submit
  );
}
