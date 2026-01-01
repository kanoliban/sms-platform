'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { Avatar, Badge, type BadgeVariant } from '@/components/ui';

export type GuestStatus = 'going' | 'invited' | 'pending' | 'waitlist' | 'declined' | 'checked-in';

export interface GuestRowProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: GuestStatus;
  role?: 'host' | 'co-host' | 'guest';
  invitedAt?: string;
  checkedInAt?: string;
  notes?: string;
  actions?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
}

const statusConfig: Record<GuestStatus, { label: string; variant: BadgeVariant }> = {
  going: { label: 'Going', variant: 'going' },
  invited: { label: 'Invited', variant: 'invited' },
  pending: { label: 'Pending', variant: 'pending' },
  waitlist: { label: 'Waitlist', variant: 'waitlist' },
  declined: { label: 'Declined', variant: 'declined' },
  'checked-in': { label: 'Checked In', variant: 'going' },
};

export function GuestRow({
  className = '',
  name,
  avatar,
  email,
  phone,
  status,
  role,
  invitedAt,
  checkedInAt,
  notes,
  actions,
  selected = false,
  onSelect,
  ...props
}: GuestRowProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`
        flex items-center gap-4
        px-4 py-3
        bg-[var(--bg-surface)]
        border-b border-[var(--border-subtle)]
        transition-colors duration-[var(--duration-fast)]
        ${selected ? 'bg-[var(--primary-muted)]' : 'hover:bg-[var(--bg-surface-hover)]'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Checkbox (if selectable) */}
      {onSelect && (
        <label className="flex-shrink-0 flex items-center justify-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="
              w-4 h-4
              rounded
              border-[var(--border-default)]
              bg-[var(--bg-subtle)]
              text-[var(--primary)]
              focus:ring-[var(--primary)]
              focus:ring-offset-0
              cursor-pointer
            "
          />
        </label>
      )}

      {/* Avatar */}
      <Avatar
        src={avatar}
        name={name}
        size="sm"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] truncate">
            {name}
          </span>
          {role && role !== 'guest' && (
            <Badge variant="default" size="sm">
              {role === 'host' ? 'Host' : 'Co-Host'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--text-muted)]">
          {email && <span className="truncate">{email}</span>}
          {email && phone && <span>·</span>}
          {phone && <span>{phone}</span>}
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
      </div>

      {/* Timestamps */}
      {(invitedAt || checkedInAt) && (
        <div className="flex-shrink-0 text-[var(--text-xs)] text-[var(--text-muted)] text-right min-w-[80px]">
          {checkedInAt ? (
            <span>Checked in {checkedInAt}</span>
          ) : invitedAt ? (
            <span>Invited {invitedAt}</span>
          ) : null}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex-shrink-0 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// GuestRow for list with bulk selection
export interface GuestListProps extends HTMLAttributes<HTMLDivElement> {
  guests: Array<Omit<GuestRowProps, 'selected' | 'onSelect'>>;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  emptyMessage?: string;
}

export function GuestList({
  className = '',
  guests,
  selectedIds,
  onSelectionChange,
  emptyMessage = 'No guests yet',
  ...props
}: GuestListProps) {
  const handleSelect = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;

    const newIds = new Set(selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    onSelectionChange(newIds);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedIds?.size === guests.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(guests.map((g) => g.name)));
    }
  };

  if (guests.length === 0) {
    return (
      <div className="py-8 text-center text-[var(--text-sm)] text-[var(--text-muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden ${className}`} {...props}>
      {/* Header with Select All */}
      {onSelectionChange && (
        <div className="flex items-center gap-4 px-4 py-2 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds?.size === guests.length}
              onChange={handleSelectAll}
              className="
                w-4 h-4
                rounded
                border-[var(--border-default)]
                bg-[var(--bg-subtle)]
                text-[var(--primary)]
                focus:ring-[var(--primary)]
                focus:ring-offset-0
              "
            />
            <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">
              Select all
            </span>
          </label>
          {selectedIds && selectedIds.size > 0 && (
            <span className="text-[var(--text-sm)] text-[var(--text-muted)]">
              {selectedIds.size} selected
            </span>
          )}
        </div>
      )}

      {/* Guest rows */}
      {guests.map((guest, index) => (
        <GuestRow
          key={guest.name + index}
          {...guest}
          selected={selectedIds?.has(guest.name)}
          onSelect={onSelectionChange ? () => handleSelect(guest.name) : undefined}
        />
      ))}
    </div>
  );
}

export default GuestRow;
