import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a Host | SMS',
  description: 'Apply to become a host and create spaces for strangers to connect.',
}

// This layout does NOT use HostAuthGuard, allowing any logged-in user to access onboarding
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
