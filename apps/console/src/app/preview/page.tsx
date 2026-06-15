import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CommandSurface,
  Input,
  Label,
  Reveal,
  StatusPill,
  Wordmark,
} from "@beckon/ui"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">{title}</h2>
      {children}
    </section>
  )
}

export default function PreviewPage() {
  return (
    <main className="mx-auto max-w-content space-y-14 px-6 py-16">
      <header className="space-y-3">
        <Wordmark />
        <h1 className="text-3xl font-semibold">Design system</h1>
        <p className="max-w-xl text-ink-muted">
          Every primitive, themed to the tokens. White surfaces, near black ink, color only for
          state. Quiet motion that respects reduced motion.
        </p>
      </header>

      <Section title="Command surface">
        <Reveal className="max-w-xl">
          <CommandSurface
            lines={[
              { role: "user", text: "Create a client named Acme" },
              { role: "agent", text: "Ready to create the client Acme. Confirm to continue." },
            ]}
          />
        </Reveal>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Publish</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Delete</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="max-w-sm space-y-2">
          <Label htmlFor="name">Workspace name</Label>
          <Input id="name" placeholder="Acme" />
        </div>
      </Section>

      <Section title="Badges and status">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="muted">Muted</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="danger">Blocked</Badge>
          <StatusPill status="pending" />
          <StatusPill status="processing" />
          <StatusPill status="ready" />
          <StatusPill status="error" />
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Demo copilot</CardTitle>
            <CardDescription>A draft agent in your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted">
              Add knowledge, wire tools, set guardrails, then install.
            </p>
          </CardContent>
        </Card>
      </Section>
    </main>
  )
}
