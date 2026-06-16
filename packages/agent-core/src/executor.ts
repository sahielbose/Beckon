import type { ExecContext, RuntimeTool, ServerToolExecutor } from "./types"

type MockHandler = (
  tool: RuntimeTool,
  args: Record<string, unknown>,
  ctx: ExecContext,
) => unknown | Promise<unknown>

/**
 * A server tool executor for tests and offline development. The real executor
 * routes through the Beckon Gateway (Section 8). By default it echoes the args.
 */
export class MockServerExecutor implements ServerToolExecutor {
  constructor(private readonly handler?: MockHandler) {}

  async execute(
    tool: RuntimeTool,
    args: Record<string, unknown>,
    ctx: ExecContext,
  ): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
    try {
      const result = this.handler
        ? await this.handler(tool, args, ctx)
        : { ok: true, tool: tool.name, args }
      return { ok: true, result }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
}
