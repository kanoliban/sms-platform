'use client';

import { type HTMLAttributes, useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-2 h-2 border' },
  sm: { container: 'w-8 h-8', text: 'text-[var(--text-xs)]', status: 'w-2.5 h-2.5 border' },
  md: { container: 'w-10 h-10', text: 'text-[var(--text-sm)]', status: 'w-3 h-3 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-[var(--text-base)]', status: 'w-3.5 h-3.5 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-[var(--text-lg)]', status: 'w-4 h-4 border-2' },
  '2xl': { container: 'w-24 h-24', text: 'text-[var(--text-2xl)]', status: 'w-5 h-5 border-2' },
};

const statusColors: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'bg-[var(--success)]',
  offline: 'bg-[var(--text-muted)]',
  away: 'bg-[var(--warning)]',
  busy: 'bg-[var(--error)]',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  if (parts.length === 1) {
    return first.charAt(0).toUpperCase();
  }
  const last = parts[parts.length - 1] ?? '';
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

function getBackgroundColor(name: string): string {
  const colors = [
    'bg-[var(--tag-red-bg)]',
    'bg-[var(--tag-orange-bg)]',
    'bg-[var(--tag-yellow-bg)]',
    'bg-[var(--tag-green-bg)]',
    'bg-[var(--tag-blue-bg)]',
    'bg-[var(--tag-purple-bg)]',
    'bg-[var(--tag-violet-bg)]',
  ] as const;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length] ?? colors[0];
}

function getTextColor(name: string): string {
  const colors = [
    'text-[var(--tag-red)]',
    'text-[var(--tag-orange)]',
    'text-[var(--tag-yellow)]',
    'text-[var(--tag-green)]',
    'text-[var(--tag-blue)]',
    'text-[var(--tag-purple)]',
    'text-[var(--tag-violet)]',
  ] as const;
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length] ?? colors[0];
}

export function Avatar({
  className = '',
  src,
  alt,
  name = '',
  size = 'md',
  status,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const styles = sizeStyles[size];
  const showFallback = !src || imgError;

  return (
    <div
      className={`
        relative inline-flex items-center justify-center flex-shrink-0
        ${styles.container}
        rounded-[var(--radius-avatar)]
        overflow-hidden
        ${showFallback ? `${getBackgroundColor(name)}` : 'bg-[var(--bg-muted)]'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {showFallback ? (
        <span
          className={`
            font-semibold
            ${styles.text}
            ${getTextColor(name)}
            select-none
          `}
        >
          {name ? getInitials(name) : '?'}
        </span>
      ) : (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${styles.status}
            rounded-full
            border-[var(--bg-base)]
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
}

export default Avatar;
