import { h } from "./dom.js";
import { openSheet } from "./sheet.js";

const OPTIONS = [
  { value: "min", label: "Menos puntos" },
  { value: "max", label: "Más puntos" },
];

// Ventana para elegir quién gana. onPick(valor) guarda el cambio; si falla,
// el error se muestra en la ventana y se puede volver a intentar.
export function pickWinMode({ current, onPick }) {
  const message = h("p", { class: "error", role: "alert" });

  const rows = OPTIONS.map((option) =>
    h(
      "button",
      {
        type: "button",
        class: "pick-row",
        "aria-pressed": String(option.value === current),
        onclick: async () => {
          if (option.value === current) return close();
          message.textContent = "";
          try {
            await onPick(option.value);
            close();
          } catch (err) {
            message.textContent = err.message;
          }
        },
      },
      option.label,
      option.value === current ? h("span", { class: "muted" }, " · actual") : null
    )
  );

  const close = openSheet(
    h("div", { class: "stack-sm" }, h("p", { class: "muted" }, "Los puntos ya apuntados se mantienen: solo cambia quién va ganando."), rows, message),
    { title: "Gana quien tenga…" }
  );
}
