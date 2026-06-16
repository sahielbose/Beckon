"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beckon/ui"
import { Check, ChevronsUpDown, LayoutGrid } from "lucide-react"
import Link from "next/link"

export function AgentSwitcher({
  agents,
  activeAgentId,
}: {
  agents: { id: string; name: string }[]
  activeAgentId?: string
}) {
  const active = agents.find((a) => a.id === activeAgentId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-md border border-line bg-bg px-2.5 py-2 text-left text-sm transition-colors duration-micro ease-standard hover:border-line-strong hover:bg-bg-subtle data-[state=open]:border-line-strong data-[state=open]:bg-bg-subtle"
        >
          <span className="truncate font-medium text-ink">{active?.name ?? "All agents"}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-faint" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[216px]">
        {agents.map((agent) => {
          const isActive = agent.id === activeAgentId
          return (
            <DropdownMenuItem key={agent.id} asChild>
              <Link href={`/app/agents/${agent.id}/playground`} className="justify-between">
                <span className="truncate">{agent.name}</span>
                {isActive ? <Check className="h-4 w-4 shrink-0 text-ink" /> : null}
              </Link>
            </DropdownMenuItem>
          )
        })}
        {agents.length > 0 ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem asChild>
          <Link href="/app">
            <LayoutGrid className="h-4 w-4" /> All agents
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
