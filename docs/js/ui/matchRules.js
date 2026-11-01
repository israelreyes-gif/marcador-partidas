import { h } from "./dom.js";
import { request } from "../api/client.js";
import { setMatchRules } from "../api/matches.js";
import { openSheet } from "./sheet.js";
import { textBlocks } from "./textBlocks.js";
import { rulesTabs } from "./rulesTabs.js";
import { customRulesForm } from "./customRulesForm.js";
import { showToast } from "./toast.js";

// Ventana de reglas de una partida: arriba las reglas de esta partida (editables
// por quien puede editarla) y debajo las del juego, como consulta.
//  - match: la partida tal cual está ahora
//  - getPassword(): contraseña de la partida, si la hay
//  - onSaved(match): se llama con la partida actualizada tras guardar
export function openMatchRules({ match, getPassword, onSaved }) {
  let customRules = match.customRules;
  let game = null;

  const mine = h("div", { class: "stack-sm" });
  const gameBlock = h("div", { class: "stack-sm" }, h("p", { class: "muted" }, "Cargando reglas del juego…"));

  function drawMine() {
    const filled = Boolean(customRules);
    mine.replaceChildren(
      h("h3", { class: "rules-title" }, "Reglas de esta partida"),
      filled ? h("div", { class: "tab-content" }, textBlocks(customRules)) : h("p", { class: "muted" }, "Sin cambios: se juega con las reglas del juego."),
      match.canEdit
        ? h("button", { type: "button", class: "btn btn-secondary", onclick: drawEditor }, filled ? "Editar reglas de esta partida" : "Añadir reglas de esta partida")
        : h("p", { class: "muted rules-hint" }, "Solo puedes ver esta partida: para cambiar las reglas necesitas la contraseña.")
    );
  }

  function drawEditor() {
    mine.replaceChildren(
      h("h3", { class: "rules-title" }, "Reglas de esta partida"),
      customRulesForm({
        initial: customRules ?? "",
        gameRules: game?.rules ?? "",
        onCancel: drawMine,
        onSubmit: async (text) => {
          const updated = await setMatchRules(match.id, text, getPassword());
          customRules = updated.customRules;
          onSaved(updated);
          showToast(customRules ? "Reglas guardadas" : "Reglas propias quitadas");
          drawMine();
        },
      })
    );
  }

  drawMine();
  openSheet(h("div", { class: "stack" }, mine, h("h3", { class: "rules-title" }, `Reglas de ${match.game.name}`), gameBlock), {
    title: "Reglas",
  });

  request("GET", `/api/games/${encodeURIComponent(match.game.id)}`)
    .then(({ game: loaded }) => {
      game = loaded;
      gameBlock.replaceChildren(rulesTabs(game));
    })
    .catch((err) => gameBlock.replaceChildren(h("p", { class: "error" }, err.message)));
}
