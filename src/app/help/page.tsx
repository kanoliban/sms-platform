'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@/components/ui';
import { PageContainer } from '@/components/layout';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  faqs: FAQItem[];
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'New to SMS? Start here.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    faqs: [
      {
        question: 'What is SMS (Strangers Meeting Strangers)?',
        answer: 'SMS is a platform that connects people through curated, intimate gatherings called "Rooms". Whether it\'s a dinner party, game night, or deep conversation, SMS helps you meet new people in meaningful ways.',
      },
      {
        question: 'How do I create an account?',
        answer: 'You can sign up with your phone number. We\'ll send you a verification code, and once verified, you can start exploring rooms and creating your profile.',
      },
      {
        question: 'Is SMS free to use?',
        answer: 'Creating an account and browsing rooms is free. Some rooms may have a ticket price set by the host, which helps cover the experience costs.',
      },
      {
        question: 'How do I find rooms near me?',
        answer: 'Use the Explore page to browse rooms. You can filter by date, location, and room type to find experiences that match your interests.',
      },
    ],
  },
  {
    id: 'attending',
    name: 'Attending Rooms',
    description: 'Everything about joining rooms.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    faqs: [
      {
        question: 'How do I join a room?',
        answer: 'Find a room you\'re interested in, read the details, and click "Request to Join" or "Get Tickets". Some rooms require host approval before you can attend.',
      },
      {
        question: 'When do I get the exact location?',
        answer: 'The exact address is revealed 24 hours before the event. You\'ll receive a notification with all the details you need.',
      },
      {
        question: 'Can I bring a friend?',
        answer: 'It depends on the room. Some hosts allow +1s, while others prefer solo attendees to maximize new connections. Check the room details for specifics.',
      },
      {
        question: 'What if I need to cancel?',
        answer: 'You can cancel your spot through the room page. Refund policies vary by room, so check the terms before booking. Generally, cancellations 48+ hours in advance are fully refundable.',
      },
      {
        question: 'What should I bring?',
        answer: 'Just yourself and an open mind! The host will provide details about anything specific in the room description or pre-event communication.',
      },
    ],
  },
  {
    id: 'hosting',
    name: 'Hosting Rooms',
    description: 'Create and manage your own rooms.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    faqs: [
      {
        question: 'How do I create a room?',
        answer: 'Go to Host Hub and click "Create Room". Fill in the details like title, description, date, location, and capacity. You can save as draft or publish immediately.',
      },
      {
        question: 'Can I charge for my room?',
        answer: 'Yes! You can set a ticket price to cover costs or create a premium experience. SMS handles payments securely and transfers funds to you after the event.',
      },
      {
        question: 'How do I approve guests?',
        answer: 'When guests request to join, you\'ll see them in your room\'s guest list with "Pending" status. Review their profile and approve or decline their request.',
      },
      {
        question: 'Can I have co-hosts?',
        answer: 'Yes, you can add team members as co-hosts who can help manage the guest list, send messages, and check in attendees.',
      },
      {
        question: 'How do I contact my guests?',
        answer: 'Use the messaging feature in your room dashboard to send updates to all confirmed guests. Individual messages are also available through guest profiles.',
      },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Refunds',
    description: 'Billing, payments, and refunds.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    faqs: [
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit and debit cards through our secure payment processor, Stripe.',
      },
      {
        question: 'When am I charged for a room?',
        answer: 'Payment is collected when you book a room. For rooms requiring approval, payment is only captured after the host approves your request.',
      },
      {
        question: 'How do refunds work?',
        answer: 'Refund policies are set by hosts. Most rooms offer full refunds for cancellations 48+ hours before the event. Check the specific room for details.',
      },
      {
        question: 'When do hosts receive payment?',
        answer: 'Host payouts are processed 24-48 hours after the room ends, once attendance is confirmed. Funds are deposited to your connected bank account.',
      },
    ],
  },
  {
    id: 'safety',
    name: 'Safety & Trust',
    description: 'How we keep the community safe.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    faqs: [
      {
        question: 'How does SMS ensure safety?',
        answer: 'All users are phone-verified. Hosts and guests are rated after each experience, building trust scores. We also have community guidelines and a reporting system.',
      },
      {
        question: 'What is a Trust Score?',
        answer: 'Trust Score reflects your reputation on SMS, based on attendance history, reviews from hosts and guests, and profile verification. Higher scores unlock more opportunities.',
      },
      {
        question: 'How do I report a problem?',
        answer: 'Use the "Report" option on any room or profile page. Our team reviews all reports within 24 hours and takes appropriate action.',
      },
      {
        question: 'What happens if I feel unsafe?',
        answer: 'Trust your instincts. You can always leave an experience early. If there\'s an immediate concern, contact local authorities first, then report through the app.',
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());

  const toggleFaq = useCallback((categoryId: string, questionIndex: number) => {
    const key = `${categoryId}-${questionIndex}`;
    setExpandedFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Filter categories and FAQs based on search
  const filteredCategories = searchQuery
    ? helpCategories
        .map((category) => ({
          ...category,
          faqs: category.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.faqs.length > 0)
    : helpCategories;

  const displayCategory = activeCategory
    ? filteredCategories.find((c) => c.id === activeCategory)
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-base)]/95 backdrop-blur z-10">
        <PageContainer>
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-bold italic text-xl tracking-tight text-[var(--text-primary)] hover:opacity-80 transition-opacity">
              SMS
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/explore"
                className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/host"
                className="text-[var(--text-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Host
              </Link>
            </nav>
          </div>
        </PageContainer>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[var(--primary-muted)] to-[var(--bg-base)] py-16">
        <PageContainer>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-[var(--text-3xl)] font-bold text-[var(--text-primary)] mb-4">
              How can we help?
            </h1>
            <p className="text-[var(--text-lg)] text-[var(--text-secondary)] mb-8">
              Find answers to common questions or get in touch with our support team.
            </p>
            <div className="relative max-w-md mx-auto">
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    setActiveCategory(null);
                  }
                }}
                placeholder="Search for help..."
                size="lg"
                className="pl-12"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Main Content */}
      <PageContainer className="py-12">
        {/* Category Grid (when no category selected and no search) */}
        {!activeCategory && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {helpCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className="text-left"
              >
                <Card className="p-6 h-full hover:border-[var(--primary)] transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] mb-4 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mb-2">
                    {category.name}
                  </h2>
                  <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                    {category.description}
                  </p>
                  <p className="text-[var(--text-sm)] text-[var(--primary)] mt-3">
                    {category.faqs.length} articles →
                  </p>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">
                Search Results
              </h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[var(--text-sm)] text-[var(--primary)] hover:text-[var(--primary-light)]"
              >
                Clear search
              </button>
            </div>
            {filteredCategories.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-[var(--text-secondary)] mb-4">
                  No results found for &quot;{searchQuery}&quot;
                </p>
                <Button variant="secondary" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredCategories.map((category) => (
                  <div key={category.id}>
                    <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                      {category.name}
                    </h3>
                    <Card className="divide-y divide-[var(--border-subtle)]">
                      {category.faqs.map((faq, index) => {
                        const isExpanded = expandedFaqs.has(`${category.id}-${index}`);
                        return (
                          <div key={index} className="p-4">
                            <button
                              type="button"
                              onClick={() => toggleFaq(category.id, index)}
                              className="w-full flex items-start justify-between text-left gap-4"
                            >
                              <span className="text-[var(--text-base)] font-medium text-[var(--text-primary)]">
                                {faq.question}
                              </span>
                              <svg
                                className={`w-5 h-5 text-[var(--text-muted)] flex-shrink-0 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                />
                              </svg>
                            </button>
                            {isExpanded && (
                              <p className="mt-3 text-[var(--text-sm)] text-[var(--text-secondary)]">
                                {faq.answer}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Detail View */}
        {activeCategory && displayCategory && !searchQuery && (
          <div className="max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-2 text-[var(--text-sm)] text-[var(--primary)] hover:text-[var(--primary-light)] mb-6"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to categories
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)]">
                {displayCategory.icon}
              </div>
              <div>
                <h2 className="text-[var(--text-xl)] font-bold text-[var(--text-primary)]">
                  {displayCategory.name}
                </h2>
                <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                  {displayCategory.faqs.length} articles
                </p>
              </div>
            </div>

            <Card className="divide-y divide-[var(--border-subtle)]">
              {displayCategory.faqs.map((faq, index) => {
                const isExpanded = expandedFaqs.has(`${displayCategory.id}-${index}`);
                return (
                  <div key={index} className="p-4">
                    <button
                      type="button"
                      onClick={() => toggleFaq(displayCategory.id, index)}
                      className="w-full flex items-start justify-between text-left gap-4"
                    >
                      <span className="text-[var(--text-base)] font-medium text-[var(--text-primary)]">
                        {faq.question}
                      </span>
                      <svg
                        className={`w-5 h-5 text-[var(--text-muted)] flex-shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    {isExpanded && (
                      <p className="mt-3 text-[var(--text-sm)] text-[var(--text-secondary)]">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* Contact Support Section */}
        <div className="max-w-2xl mx-auto mt-16">
          <Card className="p-8 text-center bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)]">
            <div className="w-16 h-16 rounded-full bg-[var(--info-muted)] flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[var(--info-text)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <h2 className="text-[var(--text-xl)] font-bold text-[var(--text-primary)] mb-3">
              Still need help?
            </h2>
            <p className="text-[var(--text-base)] text-[var(--text-secondary)] mb-6">
              Our support team is here to help. We typically respond within a few hours.
            </p>
            <Button variant="primary" size="lg">
              Contact Support
            </Button>
          </Card>
        </div>
      </PageContainer>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8 mt-12">
        <PageContainer>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
              © {new Date().getFullYear()} SMS (Strangers Meeting Strangers). All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-[var(--text-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-[var(--text-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}
