import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth/auth-context'
import { StructuredData } from '@/components/seo/structured-data'
import { DevToolbar } from '@/components/dev/dev-toolbar'

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
  alternates: {
    canonical: 'https://strangersmeetingstrangers.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external services for faster loading */}
        <link rel="preconnect" href="https://vxflxosenuzaakbmxbqb.supabase.co" />
        <link rel="dns-prefetch" href="https://vxflxosenuzaakbmxbqb.supabase.co" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
            {children}
            {process.env.NODE_ENV === 'development' && <DevToolbar />}
          </ToastProvider>
        </AuthProvider>
        <Analytics />
        <GoogleAnalytics gaId="G-4Q8R9PDFKZ" />
        <StructuredData />
      </body>
    </html>
  )
}
