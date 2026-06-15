import Link from "next/link"

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-content flex-col items-start justify-center gap-6 px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">Beckon</p>
      <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">
        An AI copilot your users can drop into any web app.
      </h1>
      <p className="max-w-xl text-ink-muted">
        Users do things by chat: call your APIs, run client functions, navigate your UI. Every
        action that writes is gated behind a confirm step.
      </p>
      <div className="flex gap-3">
        <Link
          href="/preview"
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-bg transition-colors duration-micro ease-standard hover:opacity-90"
        >
          View the design system
        </Link>
      </div>
    </main>
  )
}
