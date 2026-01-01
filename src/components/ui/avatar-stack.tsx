'use client';

import { type HTMLAttributes } from 'react';
import { Avatar, type AvatarSize } from './avatar';

export interface AvatarStackItem {
  id?: string;
  src?: string | null;
  name?: string;
  alt?: string;
}

export interface AvatarStackProps extends HTMLAttributes<HTMLDivElement> {
  avatars: AvatarStackItem[];
  max?: number;
  size?: AvatarSize;
  showCount?: boolean;
  countLabel?: string;
}

const overlapOffset: Record<AvatarSize, string> = {
  xs: '-ml-2',
  sm: '-ml-2.5',
  md: '-ml-3',
  lg: '-ml-4',
  xl: '-ml-5',
  '2xl': '-ml-6',
};

const countSizes: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[8px]' },
  sm: { container: 'w-8 h-8', text: 'text-[10px]' },
  md: { container: 'w-10 h-10', text: 'text-[var(--text-xs)]' },
  lg: { container: 'w-12 h-12', text: 'text-[var(--text-sm)]' },
  xl: { container: 'w-16 h-16', text: 'text-[var(--text-base)]' },
  '2xl': { container: 'w-24 h-24', text: 'text-[var(--text-lg)]' },
};

export function AvatarStack({
  className = '',
  avatars,
  max = 5,
  size = 'md',
  showCount = true,
  countLabel,
  ...props
}: AvatarStackProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const offset = overlapOffset[size];
  const countStyles = countSizes[size];

  return (
    <div
      className={`flex items-center ${className}`}
      {...props}
    >
      <div className="flex items-center">
        {displayAvatars.map((avatar, index) => (
          <div
            key={avatar.id || index}
            className={`
              ${index > 0 ? offset : ''}
              ring-2 ring-[var(--bg-base)]
              rounded-full
            `}
            style={{ zIndex: displayAvatars.length - index }}
          >
            <Avatar
              src={avatar.src}
              name={avatar.name}
              alt={avatar.alt || avatar.name}
              size={size}
            />
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={`
              ${offset}
              ${countStyles.container}
              flex items-center justify-center
              rounded-full
              bg-[var(--bg-muted)]
              ring-2 ring-[var(--bg-base)]
              ${countStyles.text}
              font-medium
              text-[var(--text-secondary)]
            `}
            style={{ zIndex: 0 }}
          >
            +{remaining}
          </div>
        )}
      </div>
      {showCount && countLabel && (
        <span className="ml-2 text-[var(--text-sm)] text-[var(--text-secondary)]">
          {countLabel}
        </span>
      )}
    </div>
  );
}

export default AvatarStack;
