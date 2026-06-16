// A tiny in memory CRM for the demo. Data resets when the server restarts, which
// is fine for a sandbox. This is the host backend that Beckon drives through the
// gateway. It is intentionally simple and clearly a demo store.

export type ClientStatus = "lead" | "active" | "churned"
export type DealStage = "open" | "won" | "lost"

export interface Client {
  id: string
  name: string
  industry: string
  status: ClientStatus
}
export interface Deal {
  id: string
  clientId: string
  title: string
  amount: number
  stage: DealStage
}
export interface Task {
  id: string
  clientId: string | null
  title: string
  due: string
  done: boolean
}

interface Store {
  clients: Client[]
  deals: Deal[]
  tasks: Task[]
  counter: number
}

function seed(): Store {
  return {
    counter: 100,
    clients: [
      { id: "cli_1", name: "Northwind Trading", industry: "Logistics", status: "active" },
      { id: "cli_2", name: "Globex", industry: "Manufacturing", status: "active" },
      { id: "cli_3", name: "Initech", industry: "Software", status: "lead" },
    ],
    deals: [
      { id: "deal_1", clientId: "cli_1", title: "Annual renewal", amount: 48000, stage: "won" },
      { id: "deal_2", clientId: "cli_2", title: "Expansion", amount: 32000, stage: "open" },
      { id: "deal_3", clientId: "cli_3", title: "Pilot", amount: 12000, stage: "open" },
    ],
    tasks: [
      { id: "task_1", clientId: "cli_1", title: "Send Q3 report", due: "2026-07-01", done: false },
      { id: "task_2", clientId: "cli_2", title: "Schedule a demo", due: "2026-06-20", done: false },
    ],
  }
}

const globalForStore = globalThis as unknown as { __beckonDemoStore?: Store }
const store = globalForStore.__beckonDemoStore ?? seed()
globalForStore.__beckonDemoStore = store

function nextId(prefix: string): string {
  store.counter += 1
  return `${prefix}_${store.counter}`
}

export const crm = {
  listClients: () => store.clients,
  getClient: (id: string) => store.clients.find((c) => c.id === id) ?? null,
  createClient: (input: { name: string; industry?: string }) => {
    const client: Client = {
      id: nextId("cli"),
      name: input.name,
      industry: input.industry ?? "Unknown",
      status: "lead",
    }
    store.clients.push(client)
    return client
  },
  listDeals: () => store.deals,
  createDeal: (input: { clientId: string; title: string; amount: number }) => {
    const deal: Deal = {
      id: nextId("deal"),
      clientId: input.clientId,
      title: input.title,
      amount: input.amount,
      stage: "open",
    }
    store.deals.push(deal)
    return deal
  },
  listTasks: () => store.tasks,
  createTask: (input: { clientId?: string | null; title: string; due?: string }) => {
    const task: Task = {
      id: nextId("task"),
      clientId: input.clientId ?? null,
      title: input.title,
      due: input.due ?? "",
      done: false,
    }
    store.tasks.push(task)
    return task
  },
  pnl: () => {
    const revenue = store.deals.filter((d) => d.stage === "won").reduce((s, d) => s + d.amount, 0)
    const pipeline = store.deals.filter((d) => d.stage === "open").reduce((s, d) => s + d.amount, 0)
    return {
      revenue,
      pipeline,
      clients: store.clients.length,
      openDeals: store.deals.filter((d) => d.stage === "open").length,
    }
  },
}
