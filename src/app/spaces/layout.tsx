import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Space Details',
  description: 'View details about this space and RSVP to join. Connect with strangers in Minneapolis.',
  openGraph: {
    title: 'Space Details | SMS',
    description: 'View details about this space and RSVP to join. Connect with strangers in Minneapolis.',
  },
}

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
