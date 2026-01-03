'use client';

import { useState, useCallback } from 'react';
import { SlideOver } from '@/components/layout';
import { Button, Avatar, Badge, Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '@/components/ui';
import { toast } from '@/components/ui/toast';

export type TagColor = 'red' | 'cranberry' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'violet';

export interface GuestTag {
  id: string;
  name: string;
  color: TagColor;
}

export type GuestStatus = 'going' | 'invited' | 'pending' | 'waitlist' | 'declined' | 'checked-in' | 'no-show';

export interface GuestDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: GuestStatus;
  joinedAt: string;
  spacesAttended: number;
  checkIns: number;
  totalPaid: number;
  tags: GuestTag[];
  ticketType?: string;
  notes?: string;
}

export interface GuestDetailSlideOverProps {
  open: boolean;
  onClose: () => void;
  guest: GuestDetail | null;
  onApprove?: () => Promise<void>;
  onDecline?: () => Promise<void>;
  onRemove?: () => Promise<void>;
  onBlock?: () => Promise<void>;
  onCheckIn?: () => Promise<void>;
  onAddTag?: (tag: GuestTag) => Promise<void>;
  onRemoveTag?: (tagId: string) => Promise<void>;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const tagColors: { value: TagColor; label: string; color: string; bg: string }[] = [
  { value: 'red', label: 'Red', color: 'var(--tag-red)', bg: 'var(--tag-red-bg)' },
  { value: 'cranberry', label: 'Cranberry', color: 'var(--tag-cranberry)', bg: 'var(--tag-cranberry-bg)' },
  { value: 'orange', label: 'Orange', color: 'var(--tag-orange)', bg: 'var(--tag-orange-bg)' },
  { value: 'yellow', label: 'Yellow', color: 'var(--tag-yellow)', bg: 'var(--tag-yellow-bg)' },
  { value: 'green', label: 'Green', color: 'var(--tag-green)', bg: 'var(--tag-green-bg)' },
  { value: 'blue', label: 'Blue', color: 'var(--tag-blue)', bg: 'var(--tag-blue-bg)' },
  { value: 'purple', label: 'Purple', color: 'var(--tag-purple)', bg: 'var(--tag-purple-bg)' },
  { value: 'violet', label: 'Violet', color: 'var(--tag-violet)', bg: 'var(--tag-violet-bg)' },
];

const statusConfig: Record<GuestStatus, { label: string; variant: string }> = {
  'going': { label: 'Going', variant: 'going' },
  'invited': { label: 'Invited', variant: 'invited' },
  'pending': { label: 'Pending', variant: 'pending' },
  'waitlist': { label: 'Waitlist', variant: 'waitlist' },
  'declined': { label: 'Declined', variant: 'declined' },
  'checked-in': { label: 'Checked In', variant: 'checked-in' },
  'no-show': { label: 'No Show', variant: 'no-show' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function GuestDetailSlideOver({
  open,
  onClose,
  guest,
  onApprove,
  onDecline,
  onRemove,
  onBlock,
  onCheckIn,
  onAddTag,
  onRemoveTag,
  onNavigate,
  hasPrev = false,
  hasNext = false,
}: GuestDetailSlideOverProps) {
  const [approving, setApproving] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedTagColor, setSelectedTagColor] = useState<TagColor>('blue');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleApprove = useCallback(async () => {
    if (!onApprove) return;
    setApproving(true);
    try {
      await onApprove();
      toast({
        variant: 'success',
        title: 'Guest approved',
        description: `${guest?.name} has been approved.`,
      });
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to approve',
        description: 'Could not approve the guest. Please try again.',
      });
    }
    setApproving(false);
  }, [onApprove, guest?.name, toast]);

  const handleDecline = useCallback(async () => {
    if (!onDecline) return;
    setDeclining(true);
    try {
      await onDecline();
      toast({
        variant: 'success',
        title: 'Guest declined',
        description: `${guest?.name} has been declined.`,
      });
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to decline',
        description: 'Could not decline the guest. Please try again.',
      });
    }
    setDeclining(false);
  }, [onDecline, guest?.name, toast]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;
    const confirm = window.confirm(`Are you sure you want to remove ${guest?.name}?`);
    if (!confirm) return;

    setRemoving(true);
    try {
      await onRemove();
      toast({
        variant: 'success',
        title: 'Guest removed',
        description: `${guest?.name} has been removed.`,
      });
      onClose();
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to remove',
        description: 'Could not remove the guest. Please try again.',
      });
    }
    setRemoving(false);
  }, [onRemove, guest?.name, toast, onClose]);

  const handleBlock = useCallback(async () => {
    if (!onBlock) return;
    const confirm = window.confirm(`Are you sure you want to block ${guest?.name}? They won't be able to register for any of your spaces.`);
    if (!confirm) return;

    setBlocking(true);
    try {
      await onBlock();
      toast({
        variant: 'success',
        title: 'Guest blocked',
        description: `${guest?.name} has been blocked from all your spaces.`,
      });
      onClose();
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to block',
        description: 'Could not block the guest. Please try again.',
      });
    }
    setBlocking(false);
  }, [onBlock, guest?.name, toast, onClose]);

  const handleCheckIn = useCallback(async () => {
    if (!onCheckIn) return;
    setCheckingIn(true);
    try {
      await onCheckIn();
      toast({
        variant: 'success',
        title: 'Guest checked in',
        description: `${guest?.name} has been checked in.`,
      });
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to check in',
        description: 'Could not check in the guest. Please try again.',
      });
    }
    setCheckingIn(false);
  }, [onCheckIn, guest?.name, toast]);

  const handleAddTag = useCallback(async () => {
    if (!onAddTag || !tagInput.trim()) return;
    const newTag: GuestTag = {
      id: Math.random().toString(36).substring(2, 9),
      name: tagInput.trim(),
      color: selectedTagColor,
    };
    try {
      await onAddTag(newTag);
      setTagInput('');
      setShowTagInput(false);
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to add tag',
        description: 'Could not add the tag. Please try again.',
      });
    }
  }, [onAddTag, tagInput, selectedTagColor, toast]);

  if (!guest) return null;

  const statusInfo = statusConfig[guest.status];
  const isPending = guest.status === 'pending';
  const canCheckIn = guest.status === 'going';

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      size="lg"
      title={guest.name}
      subtitle={guest.email}
      headerActions={
        <div className="flex items-center gap-1">
          {onNavigate && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('prev')}
                disabled={!hasPrev}
                className="
                  p-2 rounded-[var(--radius-md)]
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-surface-hover)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-[var(--duration-normal)]
                "
                aria-label="Previous guest"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('next')}
                disabled={!hasNext}
                className="
                  p-2 rounded-[var(--radius-md)]
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-surface-hover)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-[var(--duration-normal)]
                "
                aria-label="Next guest"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between">
          {/* Status Badge */}
          <Badge variant={statusInfo.variant as 'going' | 'invited' | 'pending' | 'waitlist' | 'declined'}>
            {statusInfo.label}
          </Badge>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isPending && onApprove && onDecline && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDecline}
                  disabled={declining}
                  loading={declining}
                >
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  disabled={approving}
                  loading={approving}
                >
                  Approve
                </Button>
              </>
            )}
            {canCheckIn && onCheckIn && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCheckIn}
                disabled={checkingIn}
                loading={checkingIn}
              >
                Check In
              </Button>
            )}
            {(onRemove || onBlock) && (
              <Dropdown>
                <DropdownTrigger asChild>
                  <button
                    type="button"
                    className="
                      p-2 rounded-[var(--radius-md)]
                      text-[var(--text-muted)]
                      hover:text-[var(--text-primary)]
                      hover:bg-[var(--bg-surface-hover)]
                      transition-colors duration-[var(--duration-normal)]
                    "
                    aria-label="More actions"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>
                </DropdownTrigger>
                <DropdownContent align="end">
                  {onRemove && (
                    <DropdownItem onClick={handleRemove} disabled={removing}>
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      Remove
                    </DropdownItem>
                  )}
                  {onRemove && onBlock && <DropdownSeparator />}
                  {onBlock && (
                    <DropdownItem onClick={handleBlock} disabled={blocking} className="text-[var(--error-text)]">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Block
                    </DropdownItem>
                  )}
                </DropdownContent>
              </Dropdown>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <Avatar src={guest.avatar} name={guest.name} size="xl" />
          <div className="min-w-0 flex-1">
            <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] truncate">
              {guest.name}
            </h3>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)] truncate">
              {guest.email}
            </p>
            {guest.phone && (
              <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                {guest.phone}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] p-3 text-center">
            <p className="text-[var(--text-xs)] text-[var(--text-muted)] mb-1">Joined On</p>
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
              {formatDate(guest.joinedAt)}
            </p>
          </div>
          <div className="bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] p-3 text-center">
            <p className="text-[var(--text-xs)] text-[var(--text-muted)] mb-1"># Rooms</p>
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
              {guest.spacesAttended}
            </p>
          </div>
          <div className="bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] p-3 text-center">
            <p className="text-[var(--text-xs)] text-[var(--text-muted)] mb-1"># Check Ins</p>
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
              {guest.checkIns}
            </p>
          </div>
          <div className="bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] p-3 text-center">
            <p className="text-[var(--text-xs)] text-[var(--text-muted)] mb-1">Revenue</p>
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
              {formatCurrency(guest.totalPaid)}
            </p>
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)] mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {guest.tags.map((tag) => {
              const colorConfig = tagColors.find(c => c.value === tag.color);
              return (
                <span
                  key={tag.id}
                  className="
                    inline-flex items-center gap-1.5 px-2.5 py-1
                    rounded-full text-[var(--text-xs)] font-medium
                    group cursor-default
                  "
                  style={{
                    backgroundColor: colorConfig?.bg,
                    color: colorConfig?.color,
                  }}
                >
                  {tag.name}
                  {onRemoveTag && (
                    <button
                      type="button"
                      onClick={() => onRemoveTag(tag.id)}
                      className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                      aria-label={`Remove ${tag.name} tag`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              );
            })}
            {onAddTag && !showTagInput && (
              <button
                type="button"
                onClick={() => setShowTagInput(true)}
                className="
                  inline-flex items-center gap-1 px-2.5 py-1
                  rounded-full text-[var(--text-xs)] font-medium
                  bg-[var(--bg-subtle)] text-[var(--text-muted)]
                  hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]
                  border border-dashed border-[var(--border-default)]
                  transition-colors duration-[var(--duration-normal)]
                "
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Tag
              </button>
            )}
          </div>

          {/* Add Tag Input */}
          {showTagInput && (
            <div className="mt-3 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] space-y-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Tag name"
                className="
                  w-full px-3 py-2
                  bg-[var(--bg-surface)] rounded-[var(--radius-md)]
                  border border-[var(--border-default)]
                  text-[var(--text-sm)] text-[var(--text-primary)]
                  placeholder:text-[var(--text-muted)]
                  focus:outline-none focus:border-[var(--border-focus)]
                  transition-colors duration-[var(--duration-normal)]
                "
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedTagColor(color.value)}
                    className={`
                      w-6 h-6 rounded-full transition-all
                      ${selectedTagColor === color.value ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-subtle)]' : ''}
                    `}
                    style={{
                      backgroundColor: color.color,
                    }}
                    aria-label={color.label}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowTagInput(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Type */}
        {guest.ticketType && (
          <div>
            <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)] mb-2">Ticket</h4>
            <Badge variant="info" size="sm">
              {guest.ticketType}
            </Badge>
          </div>
        )}

        {/* Notes */}
        {guest.notes && (
          <div>
            <h4 className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)] mb-2">Notes</h4>
            <p className="text-[var(--text-sm)] text-[var(--text-primary)] whitespace-pre-wrap">
              {guest.notes}
            </p>
          </div>
        )}

        {/* Empty State for no activity */}
        {guest.spacesAttended === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
              No spaces attended yet.
            </p>
          </div>
        )}
      </div>
    </SlideOver>
  );
}

export default GuestDetailSlideOver;
