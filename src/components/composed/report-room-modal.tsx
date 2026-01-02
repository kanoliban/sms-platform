'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Textarea, Select } from '@/components/ui';
import { toast } from '@/components/ui/toast';

export interface ReportRoomModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  onSubmit: (reason: string, category?: string) => Promise<void>;
}

const reportCategories = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'fraud', label: 'Fraud or scam' },
  { value: 'other', label: 'Other' },
];

export function ReportRoomModal({
  open,
  onClose,
  roomId,
  roomName,
  onSubmit,
}: ReportRoomModalProps) {
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!reason.trim()) {
      toast({
        variant: 'error',
        title: 'Please provide details',
        description: 'Tell us more about why you are reporting this room.',
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(reason.trim(), category || undefined);
      toast({
        variant: 'success',
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.',
      });
      setReason('');
      setCategory('');
      onClose();
    } catch {
      toast({
        variant: 'error',
        title: 'Failed to submit',
        description: 'Could not submit your report. Please try again.',
      });
    }
    setSubmitting(false);
  }, [reason, category, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    setReason('');
    setCategory('');
    onClose();
  }, [onClose]);

  // Prevent accidental closes when writing
  const handleModalClose = useCallback(() => {
    if (reason.trim()) {
      const confirm = window.confirm('Are you sure you want to close? Your report will not be saved.');
      if (!confirm) return;
    }
    handleClose();
  }, [reason, handleClose]);

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      size="md"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--error-muted)] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[var(--error-text)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <span>Report Room</span>
        </div>
      }
      description="Please share more information about why you are reporting this room."
      footer={
        <div className="flex items-center justify-between">
          <p className="text-[var(--text-xs)] text-[var(--text-muted)] max-w-[200px]">
            Reports are reviewed by our team within 24 hours.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!reason.trim() || submitting}
              loading={submitting}
              className="
                !bg-[var(--error)] hover:!bg-[var(--error-hover)]
                !text-white
              "
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Room being reported */}
        <div className="flex items-center gap-3 p-3 bg-[var(--error-muted)] rounded-[var(--radius-lg)] border border-[var(--status-declined-border)]">
          <svg
            className="w-5 h-5 text-[var(--error-text)] flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"
            />
          </svg>
          <div className="min-w-0">
            <p className="text-[var(--text-sm)] font-medium text-[var(--error-text)]">
              Reporting
            </p>
            <p className="text-[var(--text-sm)] text-[var(--text-primary)] truncate">
              {roomName}
            </p>
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
            What type of issue is this?
          </label>
          <Select
            options={reportCategories}
            value={category}
            onChange={(value) => setCategory(value)}
            placeholder="Select a category"
          />
        </div>

        {/* Reason Input */}
        <div>
          <label className="block text-[var(--text-sm)] font-medium text-[var(--text-primary)] mb-2">
            Tell us more <span className="text-[var(--error-text)]">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Any information you can share will be very helpful. Please describe what you observed and why you believe this violates our community guidelines."
            rows={5}
            maxLength={2000}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[var(--text-xs)] text-[var(--text-muted)]">
              {reason.length} / 2000
            </span>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="flex items-start gap-3 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
          <svg
            className="w-5 h-5 text-[var(--info-text)] flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <div>
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">
              Your safety matters
            </p>
            <p className="text-[var(--text-xs)] text-[var(--text-muted)] mt-1">
              If you&apos;re in immediate danger, please contact local emergency services. For urgent safety concerns, our team is available 24/7.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ReportRoomModal;
