'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export type TrustAction = 'suspend' | 'ban' | 'reinstate'

interface TrustActionUser {
  id: string
  name: string | null
  phone: string
  trust_score_overall: number
  trust_status: string
}

interface TrustActionModalProps {
  open: boolean
  onClose: () => void
  user: TrustActionUser | null
  action: TrustAction | null
  onConfirm: (userId: string, action: TrustAction, reason: string) => Promise<void>
}

const ACTION_CONFIG: Record<TrustAction, {
  title: string
  description: string
  confirmText: string
  confirmVariant: 'destructive' | 'primary'
  reasonRequired: boolean
  reasonPlaceholder: string
}> = {
  suspend: {
    title: 'Suspend User',
    description: 'This user will be logged out and unable to access the platform until reinstated.',
    confirmText: 'Suspend User',
    confirmVariant: 'destructive',
    reasonRequired: true,
    reasonPlaceholder: 'Why are you suspending this user? (e.g., multiple no-shows, policy violation)',
  },
  ban: {
    title: 'Ban User',
    description: 'This user will be permanently banned and logged out. This action can be reversed by reinstating.',
    confirmText: 'Ban User',
    confirmVariant: 'destructive',
    reasonRequired: true,
    reasonPlaceholder: 'Why are you banning this user? (e.g., harassment, fraud, repeated violations)',
  },
  reinstate: {
    title: 'Reinstate User',
    description: 'This user will regain access to the platform with active status.',
    confirmText: 'Reinstate User',
    confirmVariant: 'primary',
    reasonRequired: false,
    reasonPlaceholder: 'Optional: Add a note about why this user is being reinstated',
  },
}

export function TrustActionModal({
  open,
  onClose,
  user,
  action,
  onConfirm,
}: TrustActionModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user || !action) {
    return null
  }

  const config = ACTION_CONFIG[action]

  const handleConfirm = async () => {
    if (config.reasonRequired && !reason.trim()) {
      setError('Please provide a reason for this action')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onConfirm(user.id, action, reason.trim())
      setReason('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setReason('')
      setError(null)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={config.title}
      description={config.description}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {config.confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* User info */}
        <div className="p-3 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
              {user.name?.[0]?.toUpperCase() || user.phone[user.phone.length - 1]}
            </div>
            <div>
              <div className="font-medium text-[var(--text-primary)]">
                {user.name || 'Anonymous'}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {user.phone}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-sm text-[var(--text-secondary)]">
            <span>
              Trust Score: <span className="text-[var(--text-primary)] font-medium">{user.trust_score_overall}</span>
            </span>
            <span>
              Current Status: <span className={`font-medium ${
                user.trust_status === 'active' ? 'text-green-400' :
                user.trust_status === 'suspended' ? 'text-orange-400' :
                user.trust_status === 'banned' ? 'text-red-400' :
                'text-[var(--text-primary)]'
              }`}>
                {user.trust_status}
              </span>
            </span>
          </div>
        </div>

        {/* Reason input */}
        <div>
          <label
            htmlFor="trust-action-reason"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            Reason {config.reasonRequired ? '*' : '(optional)'}
          </label>
          <textarea
            id="trust-action-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            placeholder={config.reasonPlaceholder}
            rows={3}
            className="
              w-full px-3 py-2
              bg-[var(--bg-subtle)]
              border border-[var(--border-default)]
              rounded-[var(--radius-md)]
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
              resize-none
            "
            disabled={loading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-[var(--error-muted)] border border-[var(--error)] rounded-[var(--radius-md)]">
            <p className="text-sm text-[var(--error-text)]">{error}</p>
          </div>
        )}

        {/* Warning for destructive actions */}
        {(action === 'suspend' || action === 'ban') && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-[var(--radius-md)]">
            <p className="text-sm text-orange-300">
              This user will be immediately logged out from all active sessions.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default TrustActionModal
