'use client';

import { type HTMLAttributes } from 'react';
import { Avatar } from '@/components/ui';

export type HostRole = 'creator' | 'manager' | 'co-host';

export interface HostBadgeProps {
  name: string;
  avatar?: string;
  role: HostRole;
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

const roleLabels: Record<HostRole, string> = {
  creator: 'Creator',
  manager: 'Manager',
  'co-host': 'Co-Host',
};

const roleColors: Record<HostRole, string> = {
  creator: 'text-[var(--primary-light)]',
  manager: 'text-[var(--accent-purple)]',
  'co-host': 'text-[var(--accent-blue)]',
};

const sizeStyles = {
  sm: {
    container: 'gap-2 py-1.5 px-2',
    avatar: 'sm' as const,
    name: 'text-[var(--text-sm)]',
    role: 'text-[10px]',
  },
  md: {
    container: 'gap-2.5 py-2 px-3',
    avatar: 'md' as const,
    name: 'text-[var(--text-sm)]',
    role: 'text-[var(--text-xs)]',
  },
  lg: {
    container: 'gap-3 py-2.5 px-4',
    avatar: 'md' as const,
    name: 'text-[var(--text-base)]',
    role: 'text-[var(--text-sm)]',
  },
};

export function HostBadge({
  className = '',
  name,
  avatar,
  role,
  size = 'md',
  showRole = true,
  interactive = false,
  onClick,
}: HostBadgeProps) {
  const styles = sizeStyles[size];
  const roleColor = roleColors[role];

  const baseClassName = `
    inline-flex items-center
    ${styles.container}
    bg-[var(--bg-subtle)]
    border border-[var(--border-subtle)]
    rounded-full
    transition-colors duration-[var(--duration-normal)]
    ${interactive
      ? 'cursor-pointer hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-default)]'
      : ''
    }
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const Content = (
    <>
      <Avatar
        src={avatar}
        name={name}
        size={styles.avatar}
      />
      <div className="flex flex-col items-start min-w-0">
        <span className={`${styles.name} font-medium text-[var(--text-primary)] truncate`}>
          {name}
        </span>
        {showRole && (
          <span className={`${styles.role} font-medium ${roleColor}`}>
            {roleLabels[role]}
          </span>
        )}
      </div>
    </>
  );

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className={baseClassName}>
        {Content}
      </button>
    );
  }

  return (
    <div className={baseClassName}>
      {Content}
    </div>
  );
}

// Host Team - displays multiple hosts
export interface HostTeamProps extends HTMLAttributes<HTMLDivElement> {
  hosts: Array<{
    name: string;
    avatar?: string;
    role: HostRole;
  }>;
  max?: number;
  size?: 'sm' | 'md';
}

export function HostTeam({
  className = '',
  hosts,
  max = 3,
  size = 'sm',
  ...props
}: HostTeamProps) {
  const displayedHosts = hosts.slice(0, max);
  const remaining = hosts.length - max;

  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <span className="text-[var(--text-sm)] text-[var(--text-muted)]">Hosted by</span>
      <div className="flex items-center gap-1.5">
        {displayedHosts.map((host, index) => (
          <HostBadge
            key={host.name + index}
            name={host.name}
            avatar={host.avatar}
            role={host.role}
            size={size}
            showRole={false}
          />
        ))}
        {remaining > 0 && (
          <span className="text-[var(--text-sm)] text-[var(--text-muted)]">
            +{remaining} more
          </span>
        )}
      </div>
    </div>
  );
}

export default HostBadge;
