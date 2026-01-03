'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Textarea, Avatar } from '@/components/ui';
import { toast } from '@/components/ui/toast';

export interface ContactHostModalProps {
  open: boolean;
  onClose: () => void;
  host: {
    name: string;
    avatar?: string;
  };
  spaceName: string;
  userEmail?: string;
  onSubmit: (message: string) => Promise<void>;
}

export function ContactHostModal({
  open,
  onClose,
  host,
  spaceName,
  userEmail,
  onSubmit,
}: ContactHostModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) {
      toast({
        variant: 'error',
        title: 'Message required',
        description: 'Please enter a message for the host.',
      });
      return;
    }

    setSending(true);
    try {
      await onSubmit(message.trim());
      toast({
        variant: 'success',
        title: 'Message sent!',
        description: `Your message has been sent to ${host.name}.`,
      });
      setMessage('');
      onClose();
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to send',
        description: 'Could not send your message. Please try again.',
      });
    }
    setSending(false);
  }, [message, onSubmit, host.name, onClose]);

  const handleClose = useCallback(() => {
    setMessage('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--info-muted)] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[var(--info-text)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <span>Contact the Host</span>
        </div>
      }
      description="Have a question about the space? Send a message to the host."
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-sm)] text-[var(--text-muted)]">
            <Avatar src={host.avatar} name={host.name} size="xs" />
            <span>Sending to {host.name}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!message.trim() || sending}
              loading={sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Room Context */}
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--primary-muted)] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)] truncate">
              {spaceName}
            </p>
            <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
              Hosted by {host.name}
            </p>
          </div>
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
            Your Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's your question for the host?"
            rows={5}
            maxLength={1000}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
              {message.length} / 1000
            </span>
          </div>
        </div>

        {/* Reply Info */}
        {userEmail && (
          <div className="flex items-center gap-2 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)]">
            <svg
              className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            <p className="text-[var(--text-xs)] text-[var(--text-muted)]">
              Replies will be sent to <span className="text-[var(--text-secondary)]">{userEmail}</span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ContactHostModal;
