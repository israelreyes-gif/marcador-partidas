// Colores de los jugadores. Tienen que ser los mismos, y en el mismo orden,
// que los que asigna el servidor (worker/src/lib/matchInput.js).
export const PLAYER_COLORS = [
  "#E8B04A", "#E4675B", "#6FB7E9", "#B79CE8",
  "#7BD389", "#F2A6C8", "#9AD1D4", "#F6D365",
];

export function playerColor(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}
