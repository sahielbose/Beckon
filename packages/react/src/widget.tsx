"use client"

import type { BeckonConfig } from "@beckon/client"
import { useEffect, useState } from "react"
import { ChatSurface } from "./chat-surface"
import { ChatIcon } from "./icons"
import { injectStyles } from "./inject"
import { useOptionalBeckonConfig } from "./provider"

/** Floating chat bubble. Uses the config prop, or the nearest BeckonProvider. */
export function BeckonWidget({
  config,
  agentName = "Beckon",
  defaultOpen = false,
}: {
  config?: BeckonConfig
  agentName?: string
  defaultOpen?: boolean
}) {
  const ctxConfig = useOptionalBeckonConfig()
  const resolved = config ?? ctxConfig
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    injectStyles()
  }, [])

  if (!resolved) return null

  return (
    <div className="beckon-root">
      {open ? (
        <ChatSurface
          config={resolved}
          title={agentName}
          variant="floating"
          onClose={() => setOpen(false)}
        />
      ) : (
        <button
          type="button"
          className="beckon-bubble"
          onClick={() => setOpen(true)}
          aria-label="Open Beckon"
        >
          <ChatIcon />
        </button>
      )}
    </div>
  )
}
