import { h } from "./dom.js";

// Dibujo: una carta despistada, con la mirada perdida, buscando su partida
const CARD_ART = `
<svg viewBox="0 0 220 170" width="220" height="170" role="img" aria-label="Una carta despistada con cara de no saber dónde está">
  <ellipse cx="110" cy="158" rx="62" ry="7" fill="#000" opacity=".25"/>
  <g transform="rotate(-14 62 90)">
    <rect x="22" y="30" width="80" height="116" rx="10" fill="#1A4333" stroke="#E8B04A" stroke-width="3"/>
    <rect x="32" y="40" width="60" height="96" rx="6" fill="none" stroke="#E8B04A" stroke-opacity=".5" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="62" y="102" text-anchor="middle" font-size="46" font-family="Georgia, serif" font-weight="700" fill="#E8B04A">?</text>
  </g>
  <g transform="rotate(8 150 88)">
    <rect x="108" y="22" width="84" height="122" rx="10" fill="#F4EFE3" stroke="#0A231A" stroke-width="3"/>
    <text x="120" y="46" font-size="20" font-family="Georgia, serif" font-weight="700" fill="#C0392B">♥</text>
    <text x="180" y="138" font-size="20" font-family="Georgia, serif" font-weight="700" fill="#C0392B" transform="rotate(180 180 132)">♥</text>
    <circle cx="136" cy="76" r="11" fill="#fff" stroke="#0A231A" stroke-width="2.5"/>
    <circle cx="166" cy="76" r="11" fill="#fff" stroke="#0A231A" stroke-width="2.5"/>
    <circle cx="132" cy="78" r="4.5" fill="#0A231A"/>
    <circle cx="162" cy="78" r="4.5" fill="#0A231A"/>
    <path d="M134 108 q8 -8 16 0 t16 0" fill="none" stroke="#0A231A" stroke-width="3" stroke-linecap="round"/>
    <path d="M178 46 q4 8 0 14 q-4 -6 0 -14z" fill="#6FB7E9"/>
  </g>
</svg>`;

const MESSAGES = [
  {
    title: "¡Esta partida se ha ido a por tabaco!",
    text: "La hemos buscado por todo el mazo y no aparece. Revisa que el código esté bien escrito, o pídeselo otra vez a quien te lo pasó.",
  },
  {
    title: "Aquí falta una carta… ¡y es la partida!",
    text: "No hay ninguna partida con ese código. Puede que alguien la haya borrado o que el código tenga un despiste.",
  },
  {
    title: "Esta partida se ha escondido en la manga",
    text: "Nadie la ha visto salir. Comprueba el código: una letra de más y se esfuma.",
  },
  {
    title: "¡Mala suerte, esta carta no está en la baraja!",
    text: "El código no corresponde a ninguna partida. Prueba a escribirlo de nuevo, con calma.",
  },
];

// Pantalla para "partida no encontrada": dibujo gracioso y un mensaje al azar
export function lostState() {
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const art = h("div", { class: "lost-art" });
  art.innerHTML = CARD_ART; // dibujo fijo escrito aquí arriba, no viene de fuera

  return h(
    "div",
    { class: "lost-state" },
    art,
    h("h1", {}, message.title),
    h("p", { class: "muted" }, message.text)
  );
}
