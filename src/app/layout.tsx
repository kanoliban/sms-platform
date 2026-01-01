import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SMS - Strangers Meeting Strangers',
  description: 'Infrastructure for human connection. Rooms where strangers meet with intention.',
  openGraph: {
    title: 'SMS - Strangers Meeting Strangers',
    description: 'Infrastructure for human connection. Rooms where strangers meet with intention.',
    type: 'website',
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
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
