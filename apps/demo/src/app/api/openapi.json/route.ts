import { buildOpenApi } from "@/lib/openapi"

export const dynamic = "force-dynamic"

export function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_DEMO_URL ?? new URL(req.url).origin
  return Response.json(buildOpenApi(baseUrl))
}
