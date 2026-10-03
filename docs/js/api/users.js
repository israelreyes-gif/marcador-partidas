import { request } from "./client.js";

// Busca usuarios registrados por el principio de su nombre de usuario
export const searchUsers = (text) =>
  request("GET", `/api/users?q=${encodeURIComponent(text)}`).then((data) => data.users);
