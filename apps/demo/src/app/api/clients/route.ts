import { crm } from "@/lib/store"

export const dynamic = "force-dynamic"

export function GET() {
  return Response.json(crm.listClients())
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; industry?: string }
  if (!body.name) return Response.json({ error: "name is required" }, { status: 400 })
  return Response.json(crm.createClient({ name: body.name, industry: body.industry }), {
    status: 201,
  })
}
