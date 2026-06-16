"use client"

import { BeckonProvider, BeckonWidget } from "@beckon/react"

const agentId = process.env.NEXT_PUBLIC_BECKON_AGENT_ID
const token = process.env.NEXT_PUBLIC_BECKON_TOKEN
const apiUrl = process.env.NEXT_PUBLIC_BECKON_API_URL ?? "http://localhost:3000"

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function DemoCopilot() {
  // Until a Beckon agent is wired up (see apps/demo/README), the widget stays hidden.
  if (!agentId) return null

  return (
    <BeckonProvider
      agentId={agentId}
      token={token}
      apiUrl={apiUrl}
      onIdentify={() => "demo-user-1"}
      tools={{
        openProfitAndLoss: {
          description: "Open the profit and loss view in the page",
          handler: () => {
            scrollToSection("pnl")
            return { ok: true }
          },
        },
        openClients: {
          description: "Scroll to the clients list in the page",
          handler: () => {
            scrollToSection("clients")
            return { ok: true }
          },
        },
      }}
    >
      <BeckonWidget agentName="CRM copilot" />
    </BeckonProvider>
  )
}
