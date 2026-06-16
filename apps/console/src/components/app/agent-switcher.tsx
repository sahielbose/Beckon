"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beckon/ui"
import { ChevronsUpDown, LayoutGrid } from "lucide-react"
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
          className="flex w-full items-center justify-between gap-2 rounded-md border border-line px-2.5 py-2 text-left text-sm transition-colors duration-micro ease-standard hover:bg-bg-subtle"
        >
          <span className="truncate font-medium text-ink">{active?.name ?? "All agents"}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-faint" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[216px]">
        {agents.map((agent) => (
          <DropdownMenuItem key={agent.id} asChild>
            <Link href={`/app/agents/${agent.id}/playground`}>{agent.name}</Link>
          </DropdownMenuItem>
        ))}
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
