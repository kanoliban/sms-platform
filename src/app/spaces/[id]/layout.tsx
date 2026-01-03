import { Metadata } from 'next'

// Default metadata for rooms
export const metadata: Metadata = {
  title: 'SMS Space | Strangers Meeting Strangers',
  description: 'An intimate gathering where strangers meet with intention. No networking, just real human connection.',
  openGraph: {
    title: 'SMS Space | Strangers Meeting Strangers',
    description: 'An intimate gathering where strangers meet with intention.',
    type: 'website',
    siteName: 'SMS',
    images: [
      {
        url: '/og-space.png',
        width: 1200,
        height: 630,
        alt: 'SMS - Strangers Meeting Strangers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMS Space | Strangers Meeting Strangers',
    description: 'An intimate gathering where strangers meet with intention.',
    images: ['/og-space.png'],
  },
}

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
