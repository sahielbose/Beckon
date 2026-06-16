"use client"

import type { BeckonConfig } from "@beckon/client"
import { useEffect, useState } from "react"
import { ChatSurface } from "./chat-surface"
import { ChatIcon } from "./icons"
import { injectStyles } from "./inject"
import { useOptionalBeckonConfig } from "./provider"

/** Sidebar copilot form factor. */
export function BeckonCopilot({
  config,
  agentName = "Beckon",
  position = "right",
  width = 400,
  defaultOpen = true,
}: {
  config?: BeckonConfig
  agentName?: string
  position?: "left" | "right"
  width?: number
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
        <aside
          style={{
            position: "fixed",
            top: 0,
            [position]: 0,
            height: "100vh",
            width,
            zIndex: 2147483000,
          }}
        >
          <ChatSurface
            config={resolved}
            title={agentName}
            variant="sidebar"
            onClose={() => setOpen(false)}
          />
        </aside>
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
