// Código corto para compartir una partida (sin letras ni números que se confunden)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateMatchCode(length = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}
