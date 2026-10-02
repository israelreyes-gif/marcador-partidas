import { h } from "./dom.js";

// Convierte el texto de un juego en elementos de la pantalla.
// Formato del texto:
//  - los párrafos se separan con una línea en blanco
//  - las líneas que empiezan por "- " forman una lista
export function textBlocks(text) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());
      if (lines.every((line) => line.startsWith("- "))) {
        return h("ul", { class: "text-list" }, lines.map((line) => h("li", {}, line.slice(2))));
      }
      return h("p", { class: "text-block" }, lines.join(" "));
    });
}

// Tabla de puntuación. Formato: una línea por concepto, "Concepto | Valor".
// Las líneas sin "|" se muestran como nota debajo de la tabla.
export function scoringTable(text) {
  const rows = [];
  const notes = [];

  for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const [label, ...rest] = line.split("|");
    if (rest.length) {
      rows.push(
        h(
          "div",
          { class: "score-row" },
          h("div", {}, label.trim()),
          h("div", { class: "score-value" }, rest.join("|").trim())
        )
      );
    } else {
      notes.push(h("p", { class: "muted score-note" }, line));
    }
  }
  return rows.length || notes.length
    ? [h("div", { class: "score-table" }, rows), ...notes]
    : [];
}
