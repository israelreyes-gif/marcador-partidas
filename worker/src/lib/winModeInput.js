import { HttpError } from "./errors.js";

// Modos que se pueden elegir con la partida ya empezada: { winMode: "min" | "max" }
const EDITABLE_MODES = ["min", "max"];

export function parseWinMode(body) {
  if (!EDITABLE_MODES.includes(body.winMode)) {
    throw new HttpError(400, "El modo de victoria debe ser «min» (menos puntos) o «max» (más puntos)");
  }
  return body.winMode;
}
