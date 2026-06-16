import { Skeleton } from "@beckon/ui"

const STATS = ["conversations", "messages", "tools"]
const BARS = ["a", "b", "c", "d"]

export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-content space-y-6 px-6 py-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat} className="space-y-2 rounded-lg border border-line p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-5 w-28" />
        {BARS.map((bar) => (
          <div key={bar} className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
