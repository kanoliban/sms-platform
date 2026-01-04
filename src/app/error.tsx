'use client';

import { useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { PageContainer } from '@/components/layout';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--error-muted)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--error-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)] mb-3">
          Something went wrong
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-6 p-4 bg-[var(--bg-subtle)] rounded-[var(--radius-md)] text-left">
            <p className="text-[var(--text-xs)] font-mono text-[var(--error-text)] break-all">
              {error.message}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
