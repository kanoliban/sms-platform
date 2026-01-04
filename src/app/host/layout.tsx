import type { Metadata } from 'next'
import { HostAuthGuard } from '@/components/auth/host-auth-guard'

export const metadata: Metadata = {
  title: 'Host Dashboard',
  description: 'Manage your spaces and host gatherings for strangers to connect. Create meaningful social experiences.',
  openGraph: {
    title: 'Host Dashboard | SMS',
    description: 'Manage your spaces and host gatherings for strangers to connect. Create meaningful social experiences.',
  },
}

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <HostAuthGuard>{children}</HostAuthGuard>
}
