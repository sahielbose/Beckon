import { BeckonWidget, injectStyles } from "@beckon/react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

// Capture the script tag now, while it is the current script. Reading attributes
// later (after DOMContentLoaded) would find a null currentScript.
const script = document.currentScript as HTMLScriptElement | null

function init() {
  const agentId = script?.getAttribute("data-agent-id")
  if (!agentId) {
    console.error("[beckon] data-agent-id is required on the embed script tag.")
    return
  }
  const token = script?.getAttribute("data-token") ?? undefined
  const agentName = script?.getAttribute("data-agent-name") ?? "Beckon"
  let apiUrl = script?.getAttribute("data-api-url") ?? ""
  if (!apiUrl && script?.src) {
    try {
      apiUrl = new URL(script.src).origin
    } catch {
      apiUrl = window.location.origin
    }
  }

  const host = document.createElement("div")
  host.id = "beckon-embed-host"
  document.body.appendChild(host)
  const shadow = host.attachShadow({ mode: "open" })
  const mount = document.createElement("div")
  shadow.appendChild(mount)

  // Styles go into the shadow root, so the host page is fully isolated.
  injectStyles(shadow)

  createRoot(mount).render(
    <StrictMode>
      <BeckonWidget config={{ agentId, apiUrl, token }} agentName={agentName} />
    </StrictMode>,
  )
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
