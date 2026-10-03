import { h } from "./dom.js";
import { openSheet } from "./sheet.js";
import { searchUsers } from "../api/users.js";

const SEARCH_DELAY_MS = 250;

// Ventana para elegir un usuario registrado. Devuelve el usuario elegido
// ({ id, username, displayName }) o null si se cancela.
// excludeIds: usuarios que ya están en la partida (no se ofrecen).
export function pickUser({ excludeIds = [] } = {}) {
  return new Promise((resolve) => {
    let answer = null;
    let timer = null;
    let lastSearch = 0;

    const results = h("div", { class: "stack-sm" });
    const message = h("p", { class: "muted" }, "Escribe el nombre de usuario para buscarlo.");
    const input = h("input", {
      type: "search",
      class: "input",
      placeholder: "Buscar usuario",
      "aria-label": "Buscar usuario",
      autocomplete: "off",
      autocapitalize: "none",
      spellcheck: "false",
      maxlength: "20",
      oninput: () => {
        clearTimeout(timer);
        timer = setTimeout(search, SEARCH_DELAY_MS);
      },
    });

    async function search() {
      const text = input.value.trim();
      const thisSearch = ++lastSearch;
      if (!text) {
        results.replaceChildren();
        message.textContent = "Escribe el nombre de usuario para buscarlo.";
        return;
      }
      try {
        const users = (await searchUsers(text)).filter((user) => !excludeIds.includes(user.id));
        if (thisSearch !== lastSearch) return; // llegó tarde: ya hay una búsqueda más nueva
        message.textContent = users.length ? "" : "No hay ningún usuario con ese nombre.";
        results.replaceChildren(
          ...users.map((user) =>
            h(
              "button",
              {
                type: "button",
                class: "pick-row",
                onclick: () => {
                  answer = user;
                  close();
                },
              },
              user.displayName,
              h("span", { class: "pick-handle" }, `@${user.username}`)
            )
          )
        );
      } catch (err) {
        if (thisSearch !== lastSearch) return;
        results.replaceChildren();
        message.textContent = err.message;
      }
    }

    const close = openSheet(h("div", { class: "stack-sm" }, input, message, results), {
      title: "Elegir usuario",
      onClose: () => resolve(answer),
    });
    input.focus();
  });
}
