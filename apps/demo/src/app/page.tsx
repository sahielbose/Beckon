import { crm } from "@/lib/store"
import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@beckon/ui"

function money(n: number) {
  return `$${n.toLocaleString()}`
}

export default function DemoDashboard() {
  const clients = crm.listClients()
  const deals = crm.listDeals()
  const tasks = crm.listTasks()
  const pnl = crm.pnl()
  const clientName = (id: string | null) => clients.find((c) => c.id === id)?.name ?? "Unassigned"

  return (
    <main className="mx-auto max-w-content space-y-12 px-6 py-10">
      <header className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Acme CRM</p>
        <h1 className="text-2xl font-semibold">Sales dashboard</h1>
        <p className="text-sm text-ink-muted">
          A sample app with Beckon embedded. Open the copilot and try: create a client named Acme,
          open their profit and loss, then add a follow up task.
        </p>
      </header>

      <section id="pnl" className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          Profit and loss
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Revenue", value: money(pnl.revenue) },
            { label: "Pipeline", value: money(pnl.pipeline) },
            { label: "Open deals", value: String(pnl.openDeals) },
            { label: "Clients", value: String(pnl.clients) },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="clients" className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Clients</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} data-beckon-client={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-ink-muted">{client.industry}</TableCell>
                <TableCell>
                  <Badge variant={client.status === "active" ? "success" : "muted"}>
                    {client.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section id="deals" className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Deals</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id} data-beckon-deal={deal.id}>
                <TableCell className="font-medium">{deal.title}</TableCell>
                <TableCell className="text-ink-muted">{clientName(deal.clientId)}</TableCell>
                <TableCell>{money(deal.amount)}</TableCell>
                <TableCell>
                  <Badge variant={deal.stage === "won" ? "success" : "muted"}>{deal.stage}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section id="tasks" className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Tasks</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} data-beckon-task={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="text-ink-muted">{clientName(task.clientId)}</TableCell>
                <TableCell className="text-ink-muted">{task.due || "No date"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
