"use client"

import { createAgentAction } from "@/server/actions/agents"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "@beckon/ui"
import { useActionState } from "react"

export function CreateAgentDialog({ trigger }: { trigger: React.ReactNode }) {
  const [state, formAction, pending] = useActionState(createAgentAction, {})

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an agent</DialogTitle>
          <DialogDescription>
            Give it a name. You can add knowledge, tools, and guardrails next.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="agent-name">Name</Label>
            <Input id="agent-name" name="name" placeholder="Support copilot" required autoFocus />
          </div>
          {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              Create agent
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
