import { HttpError } from "./errors.js";

const MAX_LENGTH = 5000;

// Valida las reglas propias de una partida: { text: "..." }
// Un texto vacío significa "quitar las reglas propias" y se guarda como null.
export function parseCustomRules(body) {
  if (typeof body.text !== "string") {
    throw new HttpError(400, "Falta el texto de las reglas");
  }
  const text = body.text.trim();
  if (text.length > MAX_LENGTH) {
    throw new HttpError(400, `Las reglas no pueden pasar de ${MAX_LENGTH} caracteres`);
  }
  return text === "" ? null : text;
}
