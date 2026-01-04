import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for SMS - Strangers Meeting Strangers. Learn how we protect your data and respect your privacy.',
  openGraph: {
    title: 'Privacy Policy | SMS',
    description: 'Privacy policy for SMS - Strangers Meeting Strangers. Learn how we protect your data and respect your privacy.',
  },
  alternates: {
    canonical: 'https://strangersmeetingstrangers.com/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
