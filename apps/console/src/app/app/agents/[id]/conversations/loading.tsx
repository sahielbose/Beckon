import { Skeleton } from "@beckon/ui"

const COLUMNS = ["started", "user", "origin", "status"]
const ROWS = ["a", "b", "c", "d", "e", "f"]

export default function ConversationsLoading() {
  return (
    <div className="mx-auto max-w-content space-y-6 px-6 py-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-px rounded-lg border border-line">
        <div className="flex items-center gap-4 px-3 py-2.5">
          {COLUMNS.map((col, i) => (
            <Skeleton key={col} className="h-3" style={{ width: i === 0 ? "28%" : "20%" }} />
          ))}
        </div>
        {ROWS.map((row) => (
          <div key={row} className="flex items-center gap-4 px-3 py-3">
            <Skeleton className="h-4 w-[28%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-5 w-[16%]" />
          </div>
        ))}
      </div>
    </div>
  )
}
