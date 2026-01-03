import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth/auth-context'
import { StructuredData } from '@/components/seo/structured-data'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://strangersmeetingstrangers.com'),
  title: {
    default: 'SMS - Strangers Meeting Strangers',
    template: '%s | SMS',
  },
  description: 'Infrastructure for human connection. Rooms where strangers meet with intention.',
  keywords: ['strangers', 'meeting', 'connection', 'social', 'events', 'rooms', 'Minneapolis'],
  authors: [{ name: 'SMS' }],
  openGraph: {
    title: 'SMS - Strangers Meeting Strangers',
    description: 'Infrastructure for human connection. Rooms where strangers meet with intention.',
    url: 'https://strangersmeetingstrangers.com',
    siteName: 'SMS - Strangers Meeting Strangers',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SMS - Strangers Meeting Strangers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMS - Strangers Meeting Strangers',
    description: 'Infrastructure for human connection. Rooms where strangers meet with intention.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
        <Analytics />
        <StructuredData />
      </body>
    </html>
  )
}
