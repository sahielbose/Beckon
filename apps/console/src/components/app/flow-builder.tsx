"use client"

import { createFlowAction, deleteFlowAction, toggleFlowAction } from "@/server/actions/flows"
import { Badge, Button, Checkbox, EmptyState, Input, Label, Textarea } from "@beckon/ui"
import { Plus, Trash2, Workflow } from "lucide-react"
import { useState, useTransition } from "react"

export type FlowRow = {
  id: string
  name: string
  phrases: string[]
  stepCount: number
  enabled: boolean
}

type StepDraft = { id: string; name: string; instruction: string; allowedTools: string[] }

function newStep(): StepDraft {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  return { id, name: "", instruction: "", allowedTools: [] }
}

export function FlowBuilder({
  agentId,
  tools,
  flows,
}: {
  agentId: string
  tools: string[]
  flows: FlowRow[]
}) {
  const [name, setName] = useState("")
  const [phrases, setPhrases] = useState("")
  const [steps, setSteps] = useState<StepDraft[]>([newStep()])
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function updateStep(index: number, patch: Partial<StepDraft>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }
  function toggleStepTool(index: number, tool: string) {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              allowedTools: s.allowedTools.includes(tool)
                ? s.allowedTools.filter((t) => t !== tool)
                : [...s.allowedTools, tool],
            }
          : s,
      ),
    )
  }

  function create() {
    setError(null)
    start(async () => {
      const result = await createFlowAction({
        agentId,
        name,
        phrases: phrases
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        steps: steps
          .filter((s) => s.name.trim())
          .map(({ name, instruction, allowedTools }) => ({ name, instruction, allowedTools })),
      })
      if (result.error) {
        setError(result.error)
      } else {
        setName("")
        setPhrases("")
        setSteps([newStep()])
      }
    })
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Flows</h2>
        {flows.length === 0 ? (
          <EmptyState
            icon={<Workflow className="h-5 w-5 text-ink-faint" />}
            title="No flows yet"
            description="Create a flow to steer the agent through ordered steps with the right tools."
          />
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {flows.map((flow) => (
              <li key={flow.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{flow.name}</span>
                    <Badge variant={flow.enabled ? "success" : "muted"}>
                      {flow.enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  <p className="text-xs text-ink-faint">
                    {flow.stepCount} step{flow.stepCount === 1 ? "" : "s"} · triggers:{" "}
                    {flow.phrases.join(", ") || "none"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <form action={toggleFlowAction}>
                    <input type="hidden" name="agentId" value={agentId} />
                    <input type="hidden" name="flowId" value={flow.id} />
                    <input type="hidden" name="enabled" value={String(!flow.enabled)} />
                    <Button type="submit" variant="ghost" size="sm">
                      {flow.enabled ? "Turn off" : "Turn on"}
                    </Button>
                  </form>
                  <form action={deleteFlowAction}>
                    <input type="hidden" name="agentId" value={agentId} />
                    <input type="hidden" name="flowId" value={flow.id} />
                    <Button type="submit" variant="ghost" size="icon" aria-label="Delete flow">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="max-w-2xl space-y-4">
        <h2 className="text-base font-semibold">Create a flow</h2>
        <div className="space-y-1.5">
          <Label htmlFor="flow-name">Name</Label>
          <Input
            id="flow-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cancellation"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="flow-phrases">Trigger phrases</Label>
          <Input
            id="flow-phrases"
            value={phrases}
            onChange={(e) => setPhrases(e.target.value)}
            placeholder="cancel my plan, cancel subscription"
          />
          <p className="text-xs text-ink-faint">Separate phrases with commas.</p>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Steps</p>
          {steps.map((step, index) => (
            <div key={step.id} className="space-y-3 rounded-lg border border-line p-4">
              <Input
                value={step.name}
                onChange={(e) => updateStep(index, { name: e.target.value })}
                placeholder={`Step ${index + 1} name`}
              />
              <Textarea
                value={step.instruction}
                onChange={(e) => updateStep(index, { instruction: e.target.value })}
                placeholder="What the agent should do at this step"
                rows={2}
              />
              {tools.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {tools.map((tool) => (
                    <span key={tool} className="flex items-center gap-1.5 text-sm text-ink-muted">
                      <Checkbox
                        checked={step.allowedTools.includes(tool)}
                        onCheckedChange={() => toggleStepTool(index, tool)}
                        aria-label={`Allow ${tool} in step ${index + 1}`}
                      />
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-faint">Import tools to restrict this step.</p>
              )}
              {steps.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSteps((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove step
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSteps((prev) => [...prev, newStep()])}
          >
            <Plus className="h-4 w-4" /> Add step
          </Button>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button onClick={create} disabled={pending}>
          Create flow
        </Button>
      </section>
    </div>
  )
}
