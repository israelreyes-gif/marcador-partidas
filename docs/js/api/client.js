import { API_URL } from "../config.js";

// Error de la API: guarda el código HTTP para poder reaccionar (401, 404...)
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Llamada genérica a la API.
//  - body: objeto que se envía como JSON
//  - password: contraseña de la partida (cabecera X-Match-Password)
export async function request(method, path, { body, password } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (password) headers["X-Match-Password"] = password;

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Sin conexión con el servidor");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? "Error inesperado");
  }
  return data;
}
