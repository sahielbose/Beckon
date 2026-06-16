"use client"

import type { BeckonConfig, ClientToolSpec } from "@beckon/client"
import { type ReactNode, createContext, useContext, useMemo } from "react"

const BeckonContext = createContext<BeckonConfig | null>(null)

export function BeckonProvider({
  agentId,
  apiUrl,
  token,
  onIdentify,
  tools,
  children,
}: {
  agentId: string
  apiUrl: string
  token?: string
  onIdentify?: () => string | undefined | Promise<string | undefined>
  tools?: Record<string, ClientToolSpec>
  children: ReactNode
}) {
  const config = useMemo<BeckonConfig>(
    () => ({ agentId, apiUrl, token, onIdentify, tools }),
    [agentId, apiUrl, token, onIdentify, tools],
  )
  return <BeckonContext.Provider value={config}>{children}</BeckonContext.Provider>
}

export function useBeckonConfig(): BeckonConfig {
  const ctx = useContext(BeckonContext)
  if (!ctx) throw new Error("Wrap your app in <BeckonProvider> to use the widget.")
  return ctx
}

export function useOptionalBeckonConfig(): BeckonConfig | null {
  return useContext(BeckonContext)
}
