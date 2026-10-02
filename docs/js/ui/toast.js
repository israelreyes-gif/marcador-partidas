import { h } from "./dom.js";

let current = null;

// Mensaje breve en la parte de abajo
export function showToast(text) {
  current?.remove();
  current = h("div", { class: "toast", role: "status" }, text);
  document.body.append(current);
  setTimeout(() => current?.remove(), 2500);
}
