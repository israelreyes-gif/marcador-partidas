import { request } from "./client.js";

// Cuentas de usuario. Registro y login devuelven { token, user }.
export const register = (username, password) =>
  request("POST", "/api/auth/register", { body: { username, password } });

export const login = (username, password) =>
  request("POST", "/api/auth/login", { body: { username, password } });

export const fetchMe = () => request("GET", "/api/auth/me");

export const logout = () => request("POST", "/api/auth/logout");
