import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Founder Dashboard',
  description: 'SMS founder dashboard for managing the platform, viewing analytics, and monitoring community health.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function FounderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
