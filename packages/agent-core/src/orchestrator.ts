import { type StreamEvent, isToolAllowed, newId } from "@beckon/shared"
import { buildSystemPrompt } from "./prompt"
import { availableTools, summarizeCall, toActionRequest, toProviderTools } from "./registry"
import type { RetrievedChunk, RunContext, RunMessage, RuntimeTool } from "./types"

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? null)
  } catch {
    return JSON.stringify({ note: "result was not serializable" })
  }
}

function needsConfirmation(tool: RuntimeTool, confirmOnWrite: boolean): boolean {
  return tool.requiresConfirmation || (tool.sideEffect && confirmOnWrite)
}

/**
 * Run one turn of the agent. Retrieves context, calls the model, executes tools,
 * and streams typed events. Side effecting tools and actions emit a
 * confirmation_request and the loop awaits the widget's decision before running.
 */
export async function* runTurn(ctx: RunContext): AsyncIterable<StreamEvent> {
  const maxSteps = ctx.maxSteps ?? 6

  // 1. Retrieve knowledge (no op until Section 7 provides a retriever).
  let retrieval: RetrievedChunk[] = []
  if (ctx.retrieve) {
    try {
      retrieval = await ctx.retrieve(ctx.userMessage)
    } catch {
      retrieval = []
    }
  }
  for (const chunk of retrieval) {
    yield {
      type: "citation",
      id: chunk.sourceId,
      sourceId: chunk.sourceId,
      sourceName: chunk.sourceName,
      snippet: chunk.content.slice(0, 240),
    }
  }

  const system = buildSystemPrompt(
    { systemPrompt: ctx.systemPrompt, persona: ctx.persona },
    retrieval,
  )

  const messages: RunMessage[] = [...ctx.history, { role: "user", content: ctx.userMessage }]
  const tools = availableTools(ctx.tools, ctx.guardrails, ctx.flowAllowedTools)
  const providerTools = toProviderTools(tools)
  const byName = new Map(tools.map((t) => [t.name, t]))

  for (let step = 0; step < maxSteps; step++) {
    let text = ""
    const calls: { id: string; name: string; args: Record<string, unknown> }[] = []

    for await (const part of ctx.provider.stream({
      model: ctx.model,
      system,
      messages,
      tools: providerTools,
    })) {
      if (part.type === "text") {
        text += part.text
        yield { type: "token", text: part.text }
      } else if (part.type === "tool_call") {
        calls.push({ id: part.id, name: part.name, args: part.args })
      } else if (part.type === "finish" && part.reason === "error") {
        yield { type: "error", message: part.error ?? "The model returned an error." }
      }
    }

    if (calls.length === 0) {
      if (text.trim()) await ctx.log?.({ type: "assistant_message", content: text })
      messages.push({ role: "assistant", content: text })
      yield { type: "done", messageId: newId("message"), finishReason: "stop" }
      return
    }

    messages.push({ role: "assistant", content: text, toolCalls: calls })

    for (const call of calls) {
      const tool = byName.get(call.name)

      if (!tool) {
        yield {
          type: "tool_result",
          id: call.id,
          name: call.name,
          status: "error",
          error: "Unknown tool.",
        }
        messages.push({
          role: "tool",
          toolCallId: call.id,
          toolName: call.name,
          content: safeJson({ error: "Unknown tool" }),
        })
        continue
      }

      // Guardrail: a blocked tool is never callable, from anywhere.
      if (!isToolAllowed(ctx.guardrails, tool.name)) {
        yield {
          type: "tool_result",
          id: call.id,
          name: tool.name,
          status: "rejected",
          error: "Blocked by guardrails.",
        }
        messages.push({
          role: "tool",
          toolCallId: call.id,
          toolName: tool.name,
          content: safeJson({ error: "Blocked by guardrails" }),
        })
        await ctx.log?.({
          type: "tool_call",
          callId: call.id,
          name: tool.name,
          kind: tool.kind,
          args: call.args,
          status: "rejected",
          error: "Blocked by guardrails",
          requiresConfirmation: false,
        })
        continue
      }

      const confirm = needsConfirmation(tool, ctx.guardrails.confirmOnWrite)
      let confirmedAt: Date | undefined

      // Confirmation gate. Nothing with a side effect runs before a confirmed result.
      if (confirm) {
        const confirmId = `cfm_${call.id}`
        yield {
          type: "confirmation_request",
          id: confirmId,
          kind: tool.kind === "action" ? "action" : "tool",
          name: tool.name,
          summary: summarizeCall(tool, call.args),
          preview: call.args,
        }
        const decision = await ctx.pending.wait(`${ctx.conversationId}:${confirmId}`)
        const confirmed = decision.kind === "confirmation" ? decision.confirmed : false
        if (!confirmed) {
          if (tool.kind === "server") {
            yield {
              type: "tool_result",
              id: call.id,
              name: tool.name,
              status: "rejected",
              error: "Not confirmed.",
            }
          } else {
            const actionId = `act_${call.id}`
            yield {
              type: "action_result",
              id: actionId,
              status: "rejected",
              error: "Not confirmed.",
            }
          }
          messages.push({
            role: "tool",
            toolCallId: call.id,
            toolName: tool.name,
            content: safeJson({ error: "User did not confirm the action" }),
          })
          await ctx.log?.({
            type: "tool_call",
            callId: call.id,
            name: tool.name,
            kind: tool.kind,
            args: call.args,
            status: "rejected",
            requiresConfirmation: true,
          })
          continue
        }
        confirmedAt = new Date()
      }

      if (tool.kind === "server") {
        yield {
          type: "tool_call",
          id: call.id,
          name: tool.name,
          args: call.args,
          sideEffect: tool.sideEffect,
          requiresConfirmation: confirm,
        }
        const startedAt = Date.now()
        const exec = await ctx.serverExecutor.execute(tool, call.args, {
          conversationId: ctx.conversationId,
          agentId: ctx.agentId,
          externalUserId: ctx.externalUserId,
        })
        const latencyMs = Date.now() - startedAt

        if (exec.ok) {
          yield {
            type: "tool_result",
            id: call.id,
            name: tool.name,
            status: "success",
            result: exec.result,
          }
          messages.push({
            role: "tool",
            toolCallId: call.id,
            toolName: tool.name,
            content: safeJson(exec.result),
          })
          await ctx.log?.({
            type: "tool_call",
            callId: call.id,
            name: tool.name,
            kind: "server",
            args: call.args,
            status: "success",
            result: exec.result,
            requiresConfirmation: confirm,
            confirmedAt,
            latencyMs,
          })
        } else {
          yield {
            type: "tool_result",
            id: call.id,
            name: tool.name,
            status: "error",
            error: exec.error,
          }
          messages.push({
            role: "tool",
            toolCallId: call.id,
            toolName: tool.name,
            content: safeJson({ error: exec.error }),
          })
          await ctx.log?.({
            type: "tool_call",
            callId: call.id,
            name: tool.name,
            kind: "server",
            args: call.args,
            status: "error",
            error: exec.error,
            requiresConfirmation: confirm,
            confirmedAt,
            latencyMs,
          })
        }
        continue
      }

      // Client tool or UI action: round trip to the widget, then feed the result back.
      const actionId = `act_${call.id}`
      const action = toActionRequest(tool, call.args)
      yield {
        type: "action_request",
        id: actionId,
        name: tool.name,
        action,
        sideEffect: tool.sideEffect,
        requiresConfirmation: confirm,
      }
      const outcome = await ctx.pending.wait(`${ctx.conversationId}:${actionId}`)
      if (outcome.kind === "result" && outcome.status === "ok") {
        yield { type: "action_result", id: actionId, status: "ok", result: outcome.result }
        messages.push({
          role: "tool",
          toolCallId: call.id,
          toolName: tool.name,
          content: safeJson(outcome.result ?? { ok: true }),
        })
        await ctx.log?.({
          type: "action_event",
          actionType: tool.actionType ?? "custom",
          payload: call.args,
          status: "ok",
          result: outcome.result,
          confirmedAt,
        })
      } else {
        const error =
          outcome.kind === "result" ? (outcome.error ?? "Action failed.") : "Action failed."
        yield { type: "action_result", id: actionId, status: "error", error }
        messages.push({
          role: "tool",
          toolCallId: call.id,
          toolName: tool.name,
          content: safeJson({ error }),
        })
        await ctx.log?.({
          type: "action_event",
          actionType: tool.actionType ?? "custom",
          payload: call.args,
          status: "error",
          confirmedAt,
        })
      }
    }
  }

  yield { type: "done", messageId: newId("message"), finishReason: "max_steps" }
}
