import type { ActionResultInput, ChatRequest, StreamEvent } from "@beckon/shared"
import { executeAction } from "./executor"
import { readSSE } from "./sse"
import type { BeckonConfig } from "./types"

export interface ConfirmRequest {
  id: string
  name: string
  summary: string
  preview?: Record<string, unknown>
}

export interface ChatCallbacks {
  onEvent?: (event: StreamEvent) => void
  /** Show the confirm card and resolve with the user's decision. */
  confirm: (req: ConfirmRequest) => Promise<boolean>
  onDone?: () => void
  onError?: (message: string) => void
}

/**
 * Browser core for the Beckon widget: starts a session, streams a turn, runs client
 * actions, and reports results. Confirmation is delegated to the host UI through the
 * confirm callback, so a write never runs until the user confirms.
 */
export class BeckonClient {
  private sessionId: string | null = null

  constructor(private readonly config: BeckonConfig) {}

  private headers(): Record<string, string> {
    const headers: Record<string, string> = { "content-type": "application/json" }
    if (this.config.token) headers["x-beckon-token"] = this.config.token
    return headers
  }

  async startSession(): Promise<string> {
    if (this.sessionId) return this.sessionId
    const externalUserId = await this.config.onIdentify?.()
    const response = await fetch(`${this.config.apiUrl}/api/session`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ agentId: this.config.agentId, externalUserId }),
    })
    if (!response.ok) throw new Error("Could not start a session.")
    const data = (await response.json()) as { sessionId: string }
    this.sessionId = data.sessionId
    return data.sessionId
  }

  private toolDeclarations() {
    return Object.entries(this.config.tools ?? {}).map(([name, spec]) => ({
      name,
      description: spec.description,
      parametersSchema: spec.parameters ?? { type: "object", properties: {} },
      sideEffect: Boolean(spec.sideEffect),
    }))
  }

  async send(message: string, callbacks: ChatCallbacks): Promise<void> {
    let sessionId: string
    try {
      sessionId = await this.startSession()
    } catch {
      callbacks.onError?.("Could not connect to the agent.")
      return
    }

    const body: ChatRequest = { sessionId, message, clientTools: this.toolDeclarations() }
    const response = await fetch(`${this.config.apiUrl}/api/chat`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    })
    if (!response.ok || !response.body) {
      callbacks.onError?.("The agent could not be reached.")
      return
    }

    for await (const event of readSSE(response.body)) {
      callbacks.onEvent?.(event)
      if (event.type === "confirmation_request") {
        void callbacks
          .confirm({
            id: event.id,
            name: event.name,
            summary: event.summary,
            preview: event.preview,
          })
          .then((confirmed) =>
            this.report({ type: "confirmation", sessionId, requestId: event.id, confirmed }),
          )
      } else if (event.type === "action_request") {
        void this.runAction(sessionId, event.id, event.name, event.action)
      } else if (event.type === "done") {
        callbacks.onDone?.()
      } else if (event.type === "error") {
        callbacks.onError?.(event.message)
      }
    }
  }

  private async runAction(
    sessionId: string,
    requestId: string,
    name: string,
    action: Extract<StreamEvent, { type: "action_request" }>["action"],
  ): Promise<void> {
    try {
      const result = await executeAction(name, action, this.config.tools ?? {})
      await this.report({ type: "action_result", sessionId, requestId, status: "ok", result })
    } catch (error) {
      await this.report({
        type: "action_result",
        sessionId,
        requestId,
        status: "error",
        error: error instanceof Error ? error.message : "The action failed.",
      })
    }
  }

  private async report(input: ActionResultInput): Promise<void> {
    await fetch(`${this.config.apiUrl}/api/action-result`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(input),
    }).catch(() => {})
  }
}
