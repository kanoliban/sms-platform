import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover Spaces',
  description: 'Find and join social gatherings in Minneapolis. Browse upcoming spaces where strangers meet with intention.',
  openGraph: {
    title: 'Discover Spaces | SMS',
    description: 'Find and join social gatherings in Minneapolis. Browse upcoming spaces where strangers meet with intention.',
  },
}

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
