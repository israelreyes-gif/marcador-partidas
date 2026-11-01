import { h } from "./dom.js";
import { showToast } from "./toast.js";

// Enlace que abre la partida directamente
function matchLink(match) {
  return `${location.origin}${location.pathname}#/partida/${match.id}`;
}

async function shareMatch(match) {
  const text = `Partida de ${match.game.name}. Código: ${match.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Marcador", text, url: matchLink(match) });
    } else {
      await navigator.clipboard.writeText(matchLink(match));
      showToast("Enlace copiado");
    }
  } catch {
    // el usuario ha cerrado el menú de compartir
  }
}

const WIN_LABELS = { min: "Gana el que menos tenga", max: "Gana el que más tenga" };

// Quién gana. Si se puede cambiar (partida en marcha y con permiso), es un botón
function winModeTag(match, onWinMode) {
  const label = WIN_LABELS[match.winMode];
  if (!label) return null;
  if (match.canEdit && match.status === "active" && onWinMode) {
    return h("button", { type: "button", class: "tag tag-btn", onclick: onWinMode }, `${label} ✎`);
  }
  return h("span", { class: "tag" }, label);
}

// Cabecera: juego, estado, código y botón de compartir
export function matchHeader(match, { onWinMode } = {}) {
  const subtitle = match.status === "finished"
    ? "Partida terminada"
    : `Ronda ${match.rounds.length + 1}${match.scoreLimit ? ` · Límite ${match.scoreLimit} puntos` : ""}`;

  return h(
    "div",
    { class: "stack-sm" },
    h(
      "div",
      { class: "match-title" },
      h("div", {}, h("h1", {}, match.game.name), h("div", { class: "muted" }, subtitle)),
      h("button", { type: "button", class: "share-btn", onclick: () => shareMatch(match) }, "Compartir")
    ),
    h(
      "div",
      { class: "tags" },
      h("span", { class: "tag tag-code" }, `Código ${match.id}`),
      winModeTag(match, onWinMode),
      match.isPrivate ? h("span", { class: "tag" }, "Privada") : null,
      match.hasPassword && !match.isPrivate ? h("span", { class: "tag" }, "Con contraseña") : null
    )
  );
}
