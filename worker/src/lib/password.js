// Contraseñas cifradas con PBKDF2 (nunca se guarda la contraseña en claro)
const ITERATIONS = 100000; // máximo que admite Cloudflare Workers
const encoder = new TextEncoder();

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(text) {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
}

async function derive(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return { hash: toBase64(hash), salt: toBase64(salt) };
}

export async function verifyPassword(password, hash, salt) {
  const derived = await derive(password, fromBase64(salt));
  const expected = fromBase64(hash);
  return (
    derived.length === expected.length &&
    crypto.subtle.timingSafeEqual(derived, expected)
  );
}
