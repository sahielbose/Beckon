import { crm } from "@/lib/store"

export const dynamic = "force-dynamic"

export function GET() {
  return Response.json(crm.listDeals())
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    clientId?: string
    title?: string
    amount?: number
  }
  if (!body.clientId || !body.title || typeof body.amount !== "number") {
    return Response.json({ error: "clientId, title, and amount are required" }, { status: 400 })
  }
  return Response.json(
    crm.createDeal({ clientId: body.clientId, title: body.title, amount: body.amount }),
    { status: 201 },
  )
}
