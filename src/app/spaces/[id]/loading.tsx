import { Skeleton } from '@/components/ui/skeleton'

export default function SpaceLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header skeleton */}
      <div className="border-b border-[var(--border-subtle)] h-16 px-6">
        <div className="flex items-center justify-between h-full max-w-6xl mx-auto">
          <Skeleton className="h-8 w-16" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Two-column layout skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column - 2/5 */}
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-[var(--radius-xl)]" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* Right column - 3/5 */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            <Skeleton className="h-24 w-full rounded-[var(--radius-lg)]" />

            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-20 rounded-[var(--radius-lg)]" />
              <Skeleton className="h-20 rounded-[var(--radius-lg)]" />
            </div>

            <Skeleton className="h-12 w-full rounded-[var(--radius-lg)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
