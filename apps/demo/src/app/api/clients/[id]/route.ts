import { crm } from "@/lib/store"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = crm.getClient(id)
  if (!client) return Response.json({ error: "not found" }, { status: 404 })
  return Response.json(client)
}
