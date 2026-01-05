'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { Avatar, AvatarStack, Badge } from '@/components/ui';

export type SpaceTone = 'chill' | 'playful' | 'deep' | 'intense';

export interface SpaceCardProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  tone?: SpaceTone;
  coverImage?: string;
  hostName: string;
  hostAvatar?: string;
  guestCount?: number;
  capacity?: number;
  guests?: Array<{ name: string; image?: string }>;
  isLive?: boolean;
  href?: string;
}

const toneStyles: Record<SpaceTone, { gradient: string; accent: string }> = {
  chill: {
    gradient: 'from-[var(--tone-chill)]/20 to-transparent',
    accent: 'bg-[var(--tone-chill)]',
  },
  playful: {
    gradient: 'from-[var(--tone-playful)]/20 to-transparent',
    accent: 'bg-[var(--tone-playful)]',
  },
  deep: {
    gradient: 'from-[var(--tone-deep)]/20 to-transparent',
    accent: 'bg-[var(--tone-deep)]',
  },
  intense: {
    gradient: 'from-[var(--tone-intense)]/20 to-transparent',
    accent: 'bg-[var(--tone-intense)]',
  },
};

export function SpaceCard({
  className = '',
  id,
  title,
  date,
  time,
  location,
  tone = 'chill',
  coverImage,
  hostName,
  hostAvatar,
  guestCount = 0,
  capacity,
  guests = [],
  isLive = false,
  href,
  ...props
}: SpaceCardProps) {
  const styles = toneStyles[tone];
  const roomHref = href ?? `/spaces/${id}`;

  const CardContent = (
    <>
      {/* Cover Image / Gradient */}
      <div
        className={`
          relative
          h-32
          rounded-t-[var(--radius-lg)]
          overflow-hidden
          ${coverImage ? '' : `bg-gradient-to-br ${styles.gradient} bg-[var(--bg-subtle)]`}
        `}
      >
        {coverImage && (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-3 left-3">
            <Badge variant="live" size="sm">
              LIVE
            </Badge>
          </div>
        )}

        {/* Tone accent bar */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${styles.accent}`} />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-secondary)] mb-2">
          <span>{date}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
          <span>{(() => {
            // Format time like "7:00 PM" from "19:00:00" or "19:00"
            const parts = time.split(':').map(Number);
            const hours = parts[0] ?? 0;
            const minutes = parts[1] ?? 0;
            const d = new Date();
            d.setHours(hours, minutes);
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          })()}</span>
        </div>

        {/* Title */}
        <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)] line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Location */}
        {location && (
          <p className="text-[var(--text-sm)] text-[var(--text-muted)] truncate mb-3">
            {location}
          </p>
        )}

        {/* Host */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar
            src={hostAvatar}
            name={hostName}
            size="xs"
          />
          <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">
            Hosted by <span className="text-[var(--text-primary)]">{hostName}</span>
          </span>
        </div>

        {/* Footer: Guests */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {guests.length > 0 && (
              <AvatarStack
                avatars={guests.map((g) => ({ src: g.image, name: g.name }))}
                max={3}
                size="xs"
              />
            )}
            <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">
              {guestCount} going
              {capacity && ` of ${capacity}`}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`
        relative
        bg-[var(--bg-surface)]
        border border-[var(--border-subtle)]
        rounded-[var(--radius-lg)]
        overflow-hidden
        transition-all duration-[var(--duration-normal)]
        hover:border-[var(--border-default)]
        hover:shadow-[var(--shadow-lg)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <Link href={roomHref} className="absolute inset-0 z-10" aria-label={title}>
        <span className="sr-only">{title}</span>
      </Link>
      {CardContent}
    </div>
  );
}

export default SpaceCard;
