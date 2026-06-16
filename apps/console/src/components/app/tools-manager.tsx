"use client"

import {
  importOpenApiAction,
  toggleToolAction,
  toggleToolConfirmAction,
  updateGatewayConfigAction,
} from "@/server/actions/tools"
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@beckon/ui"
import { Wrench } from "lucide-react"
import { useActionState, useState, useTransition } from "react"

export type ToolRow = {
  id: string
  name: string
  method: string | null
  description: string
  sideEffect: boolean
  requiresConfirmation: boolean
  enabled: boolean
}

export type GatewayView = {
  baseUrl: string
  authType: "header" | "bearer" | "none"
  authHeaderName: string | null
  rateLimitPerMin: number
  hasAuthSecret: boolean
  hasSharedSecret: boolean
} | null

function ToolToggle({
  agentId,
  toolId,
  field,
  value,
}: {
  agentId: string
  toolId: string
  field: "enabled" | "requiresConfirmation"
  value: boolean
}) {
  const [on, setOn] = useState(value)
  const [pending, start] = useTransition()
  return (
    <Switch
      checked={on}
      disabled={pending}
      onCheckedChange={(next) => {
        setOn(next)
        const fd = new FormData()
        fd.set("agentId", agentId)
        fd.set("toolId", toolId)
        fd.set(field, String(next))
        start(() => {
          if (field === "enabled") void toggleToolAction(fd)
          else void toggleToolConfirmAction(fd)
        })
      }}
    />
  )
}

export function ToolsManager({
  agentId,
  tools,
  gateway,
}: {
  agentId: string
  tools: ToolRow[]
  gateway: GatewayView
}) {
  const [importState, importAction, importPending] = useActionState(importOpenApiAction, {})
  const [gatewayState, gatewayAction, gatewayPending] = useActionState(
    updateGatewayConfigAction,
    {},
  )
  const [authType, setAuthType] = useState(gateway?.authType ?? "none")

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Import an OpenAPI spec</h2>
          <p className="text-sm text-ink-muted">
            Each operation becomes a tool. Writes are gated by default.
          </p>
        </div>
        <form action={importAction} className="space-y-3">
          <input type="hidden" name="agentId" value={agentId} />
          <Textarea
            name="spec"
            rows={6}
            placeholder="Paste your OpenAPI spec here (JSON or YAML)"
            className="font-mono text-xs"
          />
          {importState.error ? <p className="text-sm text-danger">{importState.error}</p> : null}
          {importState.ok ? <p className="text-sm text-success">Spec imported.</p> : null}
          <Button type="submit" disabled={importPending}>
            Import spec
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Gateway</h2>
          <p className="text-sm text-ink-muted">
            Every server tool call is validated, rate limited, signed, and logged here.
          </p>
        </div>
        <form action={gatewayAction} className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <input type="hidden" name="agentId" value={agentId} />
          <input type="hidden" name="authType" value={authType} />
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              name="baseUrl"
              defaultValue={gateway?.baseUrl ?? ""}
              placeholder="https://api.yourapp.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="authTypeSelect">Host auth</Label>
            <Select value={authType} onValueChange={(v) => setAuthType(v as typeof authType)}>
              <SelectTrigger id="authTypeSelect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer token</SelectItem>
                <SelectItem value="header">Header key</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rateLimitPerMin">Rate limit per minute</Label>
            <Input
              id="rateLimitPerMin"
              name="rateLimitPerMin"
              type="number"
              defaultValue={gateway?.rateLimitPerMin ?? 60}
            />
          </div>
          {authType === "header" ? (
            <div className="space-y-1.5">
              <Label htmlFor="authHeaderName">Header name</Label>
              <Input
                id="authHeaderName"
                name="authHeaderName"
                defaultValue={gateway?.authHeaderName ?? ""}
                placeholder="x-api-key"
              />
            </div>
          ) : null}
          {authType !== "none" ? (
            <div className="space-y-1.5">
              <Label htmlFor="authSecret">Host credential</Label>
              <Input
                id="authSecret"
                name="authSecret"
                type="password"
                placeholder={gateway?.hasAuthSecret ? "Saved. Enter to replace." : "Your API key"}
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="sharedSecret">Shared secret</Label>
            <Input
              id="sharedSecret"
              name="sharedSecret"
              type="password"
              placeholder={
                gateway?.hasSharedSecret ? "Saved. Enter to replace." : "Used to sign calls"
              }
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={gatewayPending}>
              Save gateway
            </Button>
          </div>
          {gatewayState.ok ? (
            <p className="text-sm text-success sm:col-span-2">Gateway saved.</p>
          ) : null}
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tools</h2>
        {tools.length === 0 ? (
          <EmptyState
            icon={<Wrench className="h-5 w-5 text-ink-faint" />}
            title="No tools yet"
            description="Import an OpenAPI spec above and each operation shows up here."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Confirm</TableHead>
                <TableHead>Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <span className="font-medium text-ink">{tool.name}</span>
                    {tool.description ? (
                      <p className="mt-0.5 max-w-md text-xs text-ink-muted">{tool.description}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.sideEffect ? "default" : "muted"}>
                      {tool.method ?? "client"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ToolToggle
                      agentId={agentId}
                      toolId={tool.id}
                      field="requiresConfirmation"
                      value={tool.requiresConfirmation}
                    />
                  </TableCell>
                  <TableCell>
                    <ToolToggle
                      agentId={agentId}
                      toolId={tool.id}
                      field="enabled"
                      value={tool.enabled}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
