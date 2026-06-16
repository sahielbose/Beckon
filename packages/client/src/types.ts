export type ClientToolHandler = (args: Record<string, unknown>) => unknown | Promise<unknown>

export interface ClientToolSpec {
  description: string
  /** Whether running this has a side effect (gates confirmation). */
  sideEffect?: boolean
  parameters?: Record<string, unknown>
  handler: ClientToolHandler
}

export interface BeckonConfig {
  apiUrl: string
  agentId: string
  /** Public embed token (bpk_...). */
  token?: string
  /** Returns the current end user's id, attached to the conversation. */
  onIdentify?: () => string | undefined | Promise<string | undefined>
  /** Host functions the agent can call, by name. */
  tools?: Record<string, ClientToolSpec>
}
