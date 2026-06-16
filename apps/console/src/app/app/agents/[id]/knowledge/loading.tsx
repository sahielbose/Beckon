import { Skeleton } from "@beckon/ui"

const ROWS = ["a", "b", "c", "d"]

export default function KnowledgeLoading() {
  return (
    <div className="mx-auto max-w-content space-y-6 px-6 py-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="space-y-px rounded-lg border border-line">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center justify-between gap-4 px-3 py-3">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
