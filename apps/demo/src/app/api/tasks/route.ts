import { crm } from "@/lib/store"

export const dynamic = "force-dynamic"

export function GET() {
  return Response.json(crm.listTasks())
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    title?: string
    clientId?: string
    due?: string
  }
  if (!body.title) return Response.json({ error: "title is required" }, { status: 400 })
  return Response.json(
    crm.createTask({ title: body.title, clientId: body.clientId, due: body.due }),
    { status: 201 },
  )
}
