// Error con código HTTP: los handlers lo lanzan y index.js lo convierte en respuesta
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
