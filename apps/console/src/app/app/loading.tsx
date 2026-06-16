import { Skeleton } from "@beckon/ui"

const CARDS = ["a", "b", "c", "d", "e", "f"]

/**
 * Shown while the agents overview loads. The overview renders its own shell, so
 * this stands in for the whole frame: a calm sidebar placeholder, a top bar, and
 * a grid of agent card skeletons. Sized to match the real layout, no shift.
 */
export default function AgentsLoading() {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-bg md:flex">
        <div className="space-y-3 px-3 py-3">
          <Skeleton className="mx-1 h-5 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="flex-1" />
        <div className="border-t border-line p-3">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line py-3 pr-4 pl-16 sm:pr-6 md:pl-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-content space-y-8 px-6 py-10">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-80 max-w-full" />
              </div>
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CARDS.map((card) => (
                <div
                  key={card}
                  className="space-y-3 rounded-lg border border-line bg-bg p-5 shadow-rest"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-3 w-40 max-w-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
