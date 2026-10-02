import { h } from "./dom.js";

// Deslizador con círculo que se arrastra de izquierda a derecha.
// Tiene una posición por cada etiqueta: la posición 0 es el extremo izquierdo.
//   rangeSlider({ labels: ["", "2", "3"], ariaLabel: "Jugadores", onChange: (i) => {} })
// Devuelve { element, getValue }.
export function rangeSlider({ labels, ariaLabel, onChange }) {
  const last = labels.length - 1;
  let value = 0;

  const at = (index) => `left: ${(index / last) * 100}%`;

  const fill = h("div", { class: "range-fill" });
  const dots = labels.map((_, index) => h("span", { class: "range-dot", style: at(index) }));
  const thumb = h("div", { class: "range-thumb" });
  const track = h(
    "div",
    { class: "range-track" },
    h("div", { class: "range-rail" }),
    fill,
    dots,
    thumb
  );

  const marks = labels.map((label, index) => h("span", { class: "range-label", style: at(index) }, label));
  const scale = h("div", { class: "range-scale", "aria-hidden": "true" }, marks);

  const element = h(
    "div",
    {
      class: "range",
      role: "slider",
      tabindex: "0",
      "aria-label": ariaLabel,
      "aria-valuemin": "0",
      "aria-valuemax": String(last),
      "aria-valuenow": "0",
    },
    track,
    scale
  );

  function draw() {
    thumb.style.left = `${(value / last) * 100}%`;
    fill.style.width = `${(value / last) * 100}%`;
    dots.forEach((dot, index) => dot.classList.toggle("is-passed", index <= value));
    marks.forEach((mark, index) => mark.classList.toggle("is-active", index === value));
    element.setAttribute("aria-valuenow", String(value));
  }

  function setValue(next) {
    const clamped = Math.max(0, Math.min(last, next));
    if (clamped === value) return;
    value = clamped;
    draw();
    onChange(value);
  }

  // Posición del dedo (o del ratón) → la marca más cercana
  function valueAt(clientX) {
    const rect = track.getBoundingClientRect();
    const fraction = (clientX - rect.left) / rect.width;
    return Math.round(Math.max(0, Math.min(1, fraction)) * last);
  }

  let dragging = false;
  element.addEventListener("pointerdown", (event) => {
    dragging = true;
    element.setPointerCapture(event.pointerId);
    element.classList.add("is-dragging");
    setValue(valueAt(event.clientX));
  });
  element.addEventListener("pointermove", (event) => {
    if (dragging) setValue(valueAt(event.clientX));
  });
  const stop = () => {
    dragging = false;
    element.classList.remove("is-dragging");
  };
  element.addEventListener("pointerup", stop);
  element.addEventListener("pointercancel", stop);

  element.addEventListener("keydown", (event) => {
    const moves = { ArrowLeft: value - 1, ArrowDown: value - 1, ArrowRight: value + 1, ArrowUp: value + 1, Home: 0, End: last };
    if (!(event.key in moves)) return;
    event.preventDefault();
    setValue(moves[event.key]);
  });

  draw();
  return { element, getValue: () => value };
}
