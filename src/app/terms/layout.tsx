import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for SMS - Strangers Meeting Strangers. Understand the rules and guidelines for using our platform.',
  openGraph: {
    title: 'Terms of Service | SMS',
    description: 'Terms of service for SMS - Strangers Meeting Strangers. Understand the rules and guidelines for using our platform.',
  },
  alternates: {
    canonical: 'https://strangersmeetingstrangers.com/terms',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
