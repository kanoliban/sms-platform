import { Skeleton, SkeletonSpaceCard } from '@/components/ui/skeleton'

export default function HostDashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header skeleton */}
      <div className="border-b border-[var(--border-subtle)] h-16 px-6">
        <div className="flex items-center justify-between h-full max-w-6xl mx-auto">
          <Skeleton className="h-8 w-16" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="space-y-2 mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Skeleton className="h-24 rounded-[var(--radius-xl)]" />
          <Skeleton className="h-24 rounded-[var(--radius-xl)]" />
          <Skeleton className="h-24 rounded-[var(--radius-xl)]" />
          <Skeleton className="h-24 rounded-[var(--radius-xl)]" />
        </div>

        {/* Section header */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32 rounded-[var(--radius-lg)]" />
        </div>

        {/* Space cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonSpaceCard />
          <SkeletonSpaceCard />
          <SkeletonSpaceCard />
        </div>
      </div>
    </div>
  )
}
