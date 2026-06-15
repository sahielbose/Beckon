import { Wordmark } from "@beckon/ui"
import { Showcase } from "./showcase"

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
      <Showcase />
    </main>
  )
}
