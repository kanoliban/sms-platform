import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get answers to frequently asked questions about SMS. Learn how to join spaces, host gatherings, and connect with strangers.',
  openGraph: {
    title: 'Help Center | SMS',
    description: 'Get answers to frequently asked questions about SMS. Learn how to join spaces, host gatherings, and connect with strangers.',
  },
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
