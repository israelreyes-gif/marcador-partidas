import { HttpError } from "./errors.js";

// Lee el cuerpo de la petición como un objeto JSON
export async function readJson(request) {
  try {
    const body = await request.json();
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("no es un objeto");
    }
    return body;
  } catch {
    throw new HttpError(400, "El cuerpo debe ser un JSON válido");
  }
}
