// Bloquea el zoom con el pellizco. Safari de iPhone ignora la opción del
// viewport (user-scalable=no), así que se cortan también sus eventos de gesto.
export function disableZoom() {
  for (const type of ["gesturestart", "gesturechange", "gestureend"]) {
    document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
  }
  // Dos dedos moviéndose a la vez = pellizco
  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length > 1) event.preventDefault();
    },
    { passive: false }
  );
}
