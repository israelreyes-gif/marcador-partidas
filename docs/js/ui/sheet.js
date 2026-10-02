import { h } from "./dom.js";

// Ventana emergente que sube desde abajo. Devuelve una función para cerrarla.
// onClose se llama siempre al cerrarse (con el botón, tocando fuera o por código).
export function openSheet(content, { title, onClose } = {}) {
  const dialog = h(
    "dialog",
    { class: "sheet" },
    h(
      "div",
      { class: "sheet-head" },
      h("h2", {}, title ?? ""),
      h("button", { type: "button", class: "icon-btn", "aria-label": "Cerrar", onclick: () => dialog.close() }, "✕")
    ),
    content
  );

  // Tocar fuera de la ventana la cierra
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    dialog.remove();
    onClose?.();
  });

  document.body.append(dialog);
  dialog.showModal();
  return () => dialog.close();
}

export function isSheetOpen() {
  return document.querySelector("dialog.sheet[open]") !== null;
}
