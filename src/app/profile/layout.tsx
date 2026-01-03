import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'View and manage your SMS profile, attendance history, and trust score.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
