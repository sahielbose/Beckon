"use client"

import { ChatSurface } from "@beckon/react"

/** The in console playground: the real widget, wired to this agent through the
 *  operator session. Same widget the host app embeds. */
export function Playground({ agentId }: { agentId: string }) {
  return (
    <div className="beckon-root" style={{ maxWidth: 720 }}>
      <div className="h-[600px] overflow-hidden rounded-lg border border-line">
        <ChatSurface config={{ agentId, apiUrl: "" }} title="Playground" variant="inline" />
      </div>
    </div>
  )
}
