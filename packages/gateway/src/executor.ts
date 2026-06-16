import type { ExecContext, RuntimeTool, ServerToolExecutor } from "@beckon/agent-core"
import { type GatewayConfig, type GatewayLogEntry, callOperation } from "./gateway"
import type { ParsedOperation } from "./openapi"

export type GatewayLogSink = (entry: GatewayLogEntry) => void | Promise<void>

/**
 * The runtime's server tool executor. Routes every server tool call through the
 * gateway. A tool carries its parsed operation in `routing`. Without a gateway
 * config, server tools cannot run.
 */
export class GatewayServerExecutor implements ServerToolExecutor {
  constructor(
    private readonly config: GatewayConfig | null,
    private readonly logSink?: GatewayLogSink,
  ) {}

  async execute(
    tool: RuntimeTool,
    args: Record<string, unknown>,
    _ctx: ExecContext,
  ): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
    if (!this.config) {
      return { ok: false, error: "No gateway is configured for this agent." }
    }
    const operation = tool.routing as unknown as ParsedOperation | undefined
    if (!operation?.path) {
      return { ok: false, error: "This tool is missing its routing information." }
    }

    const result = await callOperation(this.config, operation, args)
    if (this.logSink) await this.logSink(result.log)

    if (result.ok) return { ok: true, result: result.result }
    return { ok: false, error: result.error ?? "The gateway call failed." }
  }
}
