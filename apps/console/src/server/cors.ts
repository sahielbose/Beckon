// CORS for the embed endpoints. The widget runs on the host app's origin, so the
// runtime must allow cross origin calls. Requests are still authorized by the
// embed token and the origin allowlist inside each handler. Section 15 tightens
// this further.

export function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-beckon-token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

export function preflight(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) })
}

export function json(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  })
}
