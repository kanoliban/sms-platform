'use client';

import { useState, useCallback } from 'react';
import { Modal, Input, Button, Badge } from '@/components/ui';

export interface InviteRecipient {
  id: string;
  phone: string;
  name?: string;
}

export interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (recipients: InviteRecipient[]) => Promise<void>;
  spaceName: string;
  capacity: number;
  currentCount: number;
  suggestedGuests?: InviteRecipient[];
}

// Format phone number for display
function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

// Validate phone number
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function InviteModal({
  open,
  onClose,
  onSend,
  spaceName,
  capacity,
  currentCount,
  suggestedGuests = [],
}: InviteModalProps) {
  const [phoneInput, setPhoneInput] = useState('');
  const [recipients, setRecipients] = useState<InviteRecipient[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingCapacity = capacity - currentCount;
  const canAddMore = recipients.length < remainingCapacity;

  const handleAddPhone = useCallback(() => {
    if (!phoneInput.trim()) return;

    const cleaned = phoneInput.replace(/\D/g, '');

    if (!isValidPhone(phoneInput)) {
      setError('Please enter a valid phone number');
      return;
    }

    // Check if already added
    if (recipients.some(r => r.phone.replace(/\D/g, '') === cleaned)) {
      setError('This number is already in the list');
      return;
    }

    if (!canAddMore) {
      setError('Room capacity reached');
      return;
    }

    setRecipients(prev => [...prev, {
      id: generateId(),
      phone: cleaned,
    }]);
    setPhoneInput('');
    setError(null);
  }, [phoneInput, recipients, canAddMore]);

  const handleRemoveRecipient = useCallback((id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleToggleSuggestion = useCallback((guest: InviteRecipient) => {
    const exists = recipients.some(r => r.phone === guest.phone);
    if (exists) {
      setRecipients(prev => prev.filter(r => r.phone !== guest.phone));
    } else if (canAddMore) {
      setRecipients(prev => [...prev, { ...guest, id: generateId() }]);
    }
  }, [recipients, canAddMore]);

  const handleSend = async () => {
    if (recipients.length === 0) return;

    setSending(true);
    try {
      await onSend(recipients);
      setRecipients([]);
      setPhoneInput('');
      onClose();
    } catch {
      setError('Failed to send invites. Please try again.');
    }
    setSending(false);
  };

  const handleClose = () => {
    setRecipients([]);
    setPhoneInput('');
    setError(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPhone();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <span>Invite Guests</span>
          <Badge variant="info" size="sm">
            {remainingCapacity} left
          </Badge>
        </div>
      }
      footer={
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-sm)] text-[var(--text-secondary)]">
            {recipients.length > 0 ? (
              <>{recipients.length} selected</>
            ) : (
              <>Add phone numbers to invite</>
            )}
          </span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={recipients.length === 0 || sending}
              loading={sending}
            >
              {sending ? 'Sending...' : `Send ${recipients.length > 0 ? `(${recipients.length})` : ''}`}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Input & Suggestions */}
        <div className="space-y-6">
          {/* Phone Input */}
          <div>
            <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="(612) 555-1234"
                className="flex-1"
                error={error || undefined}
              />
              <Button
                variant="secondary"
                onClick={handleAddPhone}
                disabled={!phoneInput.trim() || !canAddMore}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          {suggestedGuests.length > 0 && (
            <div>
              <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)] mb-3">
                Suggestions
              </h3>
              <div className="space-y-2">
                {suggestedGuests.map((guest) => {
                  const isSelected = recipients.some(r => r.phone === guest.phone);
                  return (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => handleToggleSuggestion(guest)}
                      disabled={!isSelected && !canAddMore}
                      className={`
                        w-full flex items-center gap-3 p-3
                        rounded-[var(--radius-lg)]
                        border transition-all duration-[var(--duration-normal)]
                        ${isSelected
                          ? 'bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--text-primary)]'
                          : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                        }
                        ${!isSelected && !canAddMore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `.trim().replace(/\s+/g, ' ')}
                    >
                      {/* Avatar */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isSelected ? 'bg-[var(--primary)]' : 'bg-[var(--bg-surface)]'}
                      `}>
                        {guest.name ? (
                          <span className={`text-[var(--text-sm)] font-medium ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <svg className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[var(--text-muted)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        {guest.name && (
                          <p className="text-[var(--text-sm)] font-medium">
                            {guest.name}
                          </p>
                        )}
                        <p className={`text-[var(--text-sm)] ${guest.name ? 'text-[var(--text-muted)]' : ''}`}>
                          {formatPhone(guest.phone)}
                        </p>
                      </div>
                      {/* Check indicator */}
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isSelected
                          ? 'bg-[var(--primary)] border-[var(--primary)]'
                          : 'border-[var(--border-default)]'
                        }
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Selected Recipients */}
        <div>
          <h3 className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)] mb-3">
            Selected ({recipients.length})
          </h3>

          {recipients.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)]">
              <svg className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-[var(--text-sm)] text-[var(--text-muted)]">
                Add phone numbers to invite guests to {spaceName}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
                      {recipient.name ? (
                        <span className="text-[var(--text-xs)] font-medium text-[var(--primary)]">
                          {recipient.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[var(--text-sm)] text-[var(--text-primary)]">
                      {recipient.name || formatPhone(recipient.phone)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(recipient.id)}
                    className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--error-text)] hover:bg-[var(--error-muted)] transition-colors"
                    aria-label="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default InviteModal;
