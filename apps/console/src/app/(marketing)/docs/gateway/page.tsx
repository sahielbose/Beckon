import { CodeBlock } from "@beckon/ui"
import Link from "next/link"

const headersSnippet = `x-beckon-signature: <HMAC SHA-256 of the request body, hex>
x-beckon-timestamp: <unix seconds when Beckon sent the request>`

const verifySnippet = `import crypto from "node:crypto"

function verify(rawBody, signature, timestamp, sharedSecret) {
  const expected = crypto
    .createHmac("sha256", sharedSecret)
    .update(timestamp + "." + rawBody)
    .digest("hex")
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature),
  )
}`

export default function GatewayPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">The gateway</h1>

      <p className="max-w-2xl leading-relaxed text-ink-muted">
        Every server tool call your agent makes passes through the Beckon Gateway before it reaches
        your backend. The gateway is the trust layer between the agent and your host. It checks the
        call, attaches the right credential, proves the call came from Beckon, and records what
        happened.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">What the gateway does</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          For each server tool call the gateway runs these steps in order. If any check fails, the
          call is rejected and the agent never reaches your backend.
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 leading-relaxed text-ink-muted marker:text-ink-faint">
          <li>Validates the arguments against the operation schema and rejects malformed calls.</li>
          <li>Restricts calls to the allow listed operations and nothing else.</li>
          <li>Rate limits each agent per minute so one agent cannot flood your backend.</li>
          <li>
            Attaches the operator's host credential, which is encrypted at rest, so the agent never
            sees the secret.
          </li>
          <li>
            Signs each request with a shared secret so your host can verify the call came from
            Beckon.
          </li>
          <li>
            Retries idempotent reads with backoff. It never retries writes, so a write runs at most
            once.
          </li>
          <li>Logs every request and response with secrets redacted from each log line.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Verifying the signature</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          The gateway signs each request with the shared secret using HMAC SHA-256 and sends two
          headers with the call.
        </p>
        <CodeBlock code={headersSnippet} />
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          On your host, recompute the signature from the request body and the shared secret, then
          compare it with the header. Reject the request if they do not match. Use a constant time
          comparison so the check does not leak the secret.
        </p>
        <CodeBlock code={verifySnippet} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Configuring the gateway</h2>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          You set up the gateway on the Tools tab of your agent. Three settings tell the gateway how
          to reach your backend and how to prove the call.
        </p>
        <ul className="max-w-2xl list-disc space-y-2 pl-5 leading-relaxed text-ink-muted marker:text-ink-faint">
          <li>
            Base URL: the address of your backend. The gateway joins each operation path to this
            URL.
          </li>
          <li>
            Auth type: bearer to send a token in the Authorization header, or header to send the
            credential in a header name you choose.
          </li>
          <li>
            Shared secret: the value the gateway uses to sign each request so your host can verify
            it.
          </li>
        </ul>
        <p className="max-w-2xl leading-relaxed text-ink-muted">
          The host credential and the shared secret are stored encrypted at rest. For the full
          picture of how the trust layer fits together, see the{" "}
          <Link href="/docs/security" className="text-ink underline underline-offset-2">
            security
          </Link>{" "}
          page.
        </p>
      </section>
    </div>
  )
}
