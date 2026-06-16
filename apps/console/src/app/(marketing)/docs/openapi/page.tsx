import { CodeBlock } from "@beckon/ui"
import Link from "next/link"

const specSnippet = `openapi: 3.0.0
info:
  title: Clients API
  version: 1.0.0
paths:
  /clients:
    get:
      operationId: listClients
      summary: List clients
    post:
      operationId: createClient
      summary: Create a client
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string`

export default function OpenApiImportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">OpenAPI import</h1>

      <p className="max-w-2xl text-ink-muted leading-relaxed">
        On an agent&apos;s Tools tab, paste or upload an OpenAPI spec in JSON or YAML. Beckon reads
        the spec and turns each operation into a callable tool, so your agent can act against your
        API without you writing tool definitions by hand.
      </p>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">From spec to tools</h2>
        <p className="max-w-2xl text-ink-muted leading-relaxed">
          Every operation in the spec becomes one tool. A read operation (GET) becomes a tool that
          fetches data. A write operation (POST, PUT, PATCH, DELETE) is detected and defaults to a
          side effect with confirmation required, so nothing changes in your system until the user
          confirms the call.
        </p>
      </div>

      <CodeBlock code={specSnippet} />

      <p className="max-w-2xl text-ink-muted leading-relaxed">
        The spec above produces two tools. The GET /clients operation becomes a read tool that lists
        clients. The POST /clients operation becomes a write tool that creates a client from a name
        field, marked as a side effect with confirmation required.
      </p>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Toggle and confirm</h2>
        <p className="max-w-2xl text-ink-muted leading-relaxed">
          After import, each tool shows up in the list. You can toggle any tool on or off to control
          whether the agent can use it, and you can flip its confirm flag. Turn confirm on for a
          sensitive read, or off for a write you trust to run on its own.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">How calls run</h2>
        <p className="max-w-2xl text-ink-muted leading-relaxed">
          Every generated tool call runs through the{" "}
          <Link href="/docs/gateway" className="text-ink underline">
            Beckon Gateway
          </Link>
          , which validates the request, applies rate limits, and redacts secrets before the call
          reaches your backend.
        </p>
      </div>
    </div>
  )
}
