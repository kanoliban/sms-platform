import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | SMS',
  description: 'The page you\'re looking for doesn\'t exist or has been moved.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* 404 illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--bg-subtle)] mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-6xl font-bold text-[var(--text-primary)] mb-2">404</h1>
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
          Page not found
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/discover"
            className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-lg)] bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Discover Spaces
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Go Home
          </Link>
        </div>

        {/* Help link */}
        <p className="mt-8 text-sm text-[var(--text-muted)]">
          Need help?{' '}
          <Link href="/help" className="text-[var(--primary)] hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
