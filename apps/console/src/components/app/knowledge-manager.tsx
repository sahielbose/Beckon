"use client"

import {
  addFileSourceAction,
  addUrlSourceAction,
  reindexSourceAction,
  removeSourceAction,
} from "@/server/actions/knowledge"
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  StatusPill,
  type StatusValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@beckon/ui"
import { BookOpen, RefreshCw, Trash2 } from "lucide-react"
import { useActionState } from "react"

export type SourceRow = {
  id: string
  name: string
  type: "file" | "url"
  status: StatusValue
  error: string | null
  created: string
}

export function KnowledgeManager({
  agentId,
  sources,
}: {
  agentId: string
  sources: SourceRow[]
}) {
  const [urlState, urlAction, urlPending] = useActionState(addUrlSourceAction, {})

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <form action={urlAction} className="space-y-2">
          <input type="hidden" name="agentId" value={agentId} />
          <Label htmlFor="url">Add a URL</Label>
          <div className="flex gap-2">
            <Input id="url" name="url" placeholder="https://docs.example.com/guide" />
            <Button type="submit" disabled={urlPending}>
              Add URL
            </Button>
          </div>
          {urlState.error ? <p className="text-sm text-danger">{urlState.error}</p> : null}
        </form>

        <form action={addFileSourceAction} className="space-y-2">
          <input type="hidden" name="agentId" value={agentId} />
          <Label htmlFor="file">Add a file</Label>
          <div className="flex gap-2">
            <input
              id="file"
              name="file"
              type="file"
              accept=".txt,.md,.markdown,.pdf,.docx,.html,.htm"
              className="block w-full rounded-md border border-line bg-bg text-sm text-ink-muted file:mr-3 file:border-0 file:bg-bg-subtle file:px-3 file:py-2 file:text-sm file:text-ink"
            />
            <Button type="submit" variant="secondary">
              Add file
            </Button>
          </div>
          <p className="text-xs text-ink-faint">Text, Markdown, PDF, Word, or HTML.</p>
        </form>
      </div>

      {sources.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-5 w-5 text-ink-faint" />}
          title="Add your first knowledge source"
          description="Upload a document or add a URL so the agent can answer from your own content."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell>
                  <span className="font-medium text-ink">{source.name}</span>
                  {source.status === "error" && source.error ? (
                    <p className="mt-0.5 text-xs text-danger">{source.error}</p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge variant="muted">{source.type}</Badge>
                </TableCell>
                <TableCell>
                  <StatusPill status={source.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {source.type === "url" ? (
                      <form action={reindexSourceAction}>
                        <input type="hidden" name="agentId" value={agentId} />
                        <input type="hidden" name="sourceId" value={source.id} />
                        <Button type="submit" variant="ghost" size="icon" aria-label="Re-index">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </form>
                    ) : null}
                    <form action={removeSourceAction}>
                      <input type="hidden" name="agentId" value={agentId} />
                      <input type="hidden" name="sourceId" value={source.id} />
                      <Button type="submit" variant="ghost" size="icon" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
