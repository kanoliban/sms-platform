import type { Metadata } from 'next'
import { BreadcrumbSchema } from '@/components/seo/structured-data'

export const metadata: Metadata = {
  title: 'Discover Spaces',
  description: 'Find and join social gatherings in Minneapolis. Browse upcoming spaces where strangers meet with intention.',
  openGraph: {
    title: 'Discover Spaces | SMS',
    description: 'Find and join social gatherings in Minneapolis. Browse upcoming spaces where strangers meet with intention.',
  },
  alternates: {
    canonical: 'https://strangersmeetingstrangers.com/discover',
  },
}

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://strangersmeetingstrangers.com' },
          { name: 'Discover', url: 'https://strangersmeetingstrangers.com/discover' },
        ]}
      />
      {children}
    </>
  )
}
