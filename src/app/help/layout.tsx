import type { Metadata } from 'next'
import Script from 'next/script'
import { BreadcrumbSchema } from '@/components/seo/structured-data'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Get answers to frequently asked questions about SMS. Learn how to join spaces, host gatherings, and connect with strangers.',
  openGraph: {
    title: 'Help Center | SMS',
    description: 'Get answers to frequently asked questions about SMS. Learn how to join spaces, host gatherings, and connect with strangers.',
  },
  alternates: {
    canonical: 'https://strangersmeetingstrangers.com/help',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is SMS (Strangers Meeting Strangers)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SMS is a platform that connects people through curated, intimate gatherings called "Spaces". Whether it\'s a dinner party, game night, or deep conversation, SMS helps you meet new people in meaningful ways.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I create an account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can sign up with your phone number. We\'ll send you a verification code, and once verified, you can start exploring spaces and creating your profile.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is SMS free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Creating an account and browsing spaces is free. Some spaces may have a ticket price set by the host, which helps cover the experience costs.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I join a space?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Find a space you\'re interested in, read the details, and click "Request to Join" or "Get Tickets". Some spaces require host approval before you can attend.',
      },
    },
    {
      '@type': 'Question',
      name: 'When do I get the exact location?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The exact address is revealed 24 hours before the event. You\'ll receive a notification with all the details you need.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I create a space?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to Host Hub and click "Create Space". Fill in the details like title, description, date, location, and capacity. You can save as draft or publish immediately.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I charge for my space?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! You can set a ticket price to cover costs or create a premium experience. SMS handles payments securely and transfers funds to you after the event.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a Trust Score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trust Score reflects your reputation on SMS, based on attendance history, reviews from hosts and guests, and profile verification. Higher scores unlock more opportunities.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does SMS ensure safety?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All users are phone-verified. Hosts and guests are rated after each experience, building trust scores. We also have community guidelines and a reporting system.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do refunds work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Refund policies are set by hosts. Most spaces offer full refunds for cancellations 48+ hours before the event. Check the specific space for details.',
      },
    },
  ],
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://strangersmeetingstrangers.com' },
          { name: 'Help', url: 'https://strangersmeetingstrangers.com/help' },
        ]}
      />
      {children}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(faqSchema)}
      </Script>
    </>
  )
}
