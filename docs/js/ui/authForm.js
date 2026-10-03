import { h } from "./dom.js";
import { login, register } from "../api/auth.js";
import { saveSession } from "../storage/session.js";

const MODES = [
  { id: "login", label: "Entrar", submit: "Entrar" },
  { id: "register", label: "Crear cuenta", submit: "Crear cuenta" },
];

// Formulario para entrar o crear una cuenta. Al terminar llama a onDone(user).
export function authForm({ onDone }) {
  let mode = "login";
  let sending = false;

  const modeBar = h("div", { class: "segmented" });
  const fields = h("div", { class: "stack-sm" });
  const message = h("p", { class: "error", role: "alert" });
  const submit = h("button", { type: "submit", class: "btn" });

  const username = h("input", {
    type: "text",
    class: "input",
    placeholder: "Usuario",
    "aria-label": "Usuario",
    autocomplete: "username",
    autocapitalize: "none",
    autocorrect: "off",
    spellcheck: "false",
    maxlength: "20",
  });
  const password = h("input", {
    type: "password",
    class: "input",
    placeholder: "Contraseña",
    "aria-label": "Contraseña",
    maxlength: "64",
  });
  const repeat = h("input", {
    type: "password",
    class: "input",
    placeholder: "Repite la contraseña",
    "aria-label": "Repite la contraseña",
    autocomplete: "new-password",
    maxlength: "64",
  });
  const hint = h(
    "p",
    { class: "muted auth-hint" },
    "Usuario de 3 a 20 letras, números o _. Contraseña de al menos 6 caracteres. " +
      "Apúntala: no se puede recuperar si la olvidas."
  );

  function draw() {
    const current = MODES.find((item) => item.id === mode);
    password.setAttribute("autocomplete", mode === "login" ? "current-password" : "new-password");
    submit.textContent = sending ? "Un momento…" : current.submit;
    submit.disabled = sending;
    message.textContent = "";

    modeBar.replaceChildren(
      ...MODES.map((item) =>
        h(
          "button",
          {
            type: "button",
            "aria-pressed": String(item.id === mode),
            onclick: () => {
              mode = item.id;
              draw();
            },
          },
          item.label
        )
      )
    );
    fields.replaceChildren(username, password, ...(mode === "register" ? [repeat, hint] : []));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (sending) return;

    if (mode === "register" && password.value !== repeat.value) {
      message.textContent = "Las contraseñas no coinciden";
      return;
    }

    sending = true;
    submit.disabled = true;
    submit.textContent = "Un momento…";
    message.textContent = "";
    try {
      const action = mode === "login" ? login : register;
      const { token, user } = await action(username.value.trim(), password.value);
      saveSession(token, user);
      onDone(user);
    } catch (err) {
      sending = false;
      submit.disabled = false;
      submit.textContent = MODES.find((item) => item.id === mode).submit;
      message.textContent = err.message;
    }
  }

  draw();
  return h("form", { class: "stack", novalidate: true, onsubmit: onSubmit }, modeBar, fields, message, submit);
}
