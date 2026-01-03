import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Spaces',
  description: 'View your upcoming and past spaces. Manage your RSVPs and attendance history.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MySpacesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
