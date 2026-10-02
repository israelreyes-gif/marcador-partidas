// Permite que la PWA (GitHub Pages) llame a esta API
function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Match-Password",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function preflight(env) {
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

export function withCors(response, env) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders(env))) {
    headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, headers });
}
