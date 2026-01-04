'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Settings has been merged into the Profile page.
 * This page redirects to /profile?tab=settings
 */
export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=settings');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="text-[var(--text-secondary)]">Redirecting...</div>
    </div>
  );
}
