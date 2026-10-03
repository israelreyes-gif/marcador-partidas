import { h } from "./dom.js";

// Selector numérico con botones − y +.
//   stepper({ label, value, min, max, step, onChange })
// Devuelve { element, getValue, setValue }.
export function stepper({ label, value, min, max, step = 1, onChange = () => {} }) {
  let current = value;
  const display = h("div", { class: "stepper-value" }, String(current));
  const minus = h("button", { type: "button", "aria-label": `Restar a ${label}`, onclick: () => change(-step) }, "−");
  const plus = h("button", { type: "button", "aria-label": `Sumar a ${label}`, onclick: () => change(step) }, "+");

  function draw() {
    display.textContent = String(current);
    minus.disabled = current <= min;
    plus.disabled = current >= max;
  }

  function setValue(next) {
    current = Math.max(min, Math.min(max, next));
    draw();
  }

  function change(delta) {
    setValue(current + delta);
    onChange(current);
  }

  draw();
  return {
    element: h("div", { class: "stepper" }, h("div", {}, label), h("div", { class: "stepper-controls" }, minus, display, plus)),
    getValue: () => current,
    setValue,
  };
}
