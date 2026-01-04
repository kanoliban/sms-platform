import { Skeleton, SkeletonList } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
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

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-28 rounded-[var(--radius-lg)]" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Skeleton className="h-9 w-16 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-18 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>

        {/* Notification list */}
        <SkeletonList count={5} />
      </div>
    </div>
  )
}
