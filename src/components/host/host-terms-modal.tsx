'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui'

interface HostTermsModalProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
  termsContent: string
  termsTitle: string
}

export function HostTermsModal({
  open,
  onClose,
  onAccept,
  termsContent,
  termsTitle,
}: HostTermsModalProps) {
  // Simple markdown-like rendering for the terms
  const renderTermsContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-[var(--text-xl)] font-bold text-[var(--text-primary)] mt-6 mb-3">
            {line.slice(2)}
          </h1>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)] mt-5 mb-2">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-[var(--text-base)] font-medium text-[var(--text-primary)] mt-4 mb-2">
            {line.slice(4)}
          </h3>
        )
      }
      // Bold text (simple version)
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="text-[var(--text-sm)] font-semibold text-[var(--text-secondary)] mb-2">
            {line.slice(2, -2)}
          </p>
        )
      }
      // List items
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="text-[var(--text-sm)] text-[var(--text-secondary)] ml-4 mb-1">
            {line.slice(2)}
          </li>
        )
      }
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />
      }
      // Regular paragraphs
      return (
        <p key={index} className="text-[var(--text-sm)] text-[var(--text-secondary)] mb-2">
          {line}
        </p>
      )
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <span>{termsTitle}</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onAccept}>
            Accept Terms
          </Button>
        </div>
      }
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {renderTermsContent(termsContent)}
      </div>
      <p className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-[var(--text-xs)] text-[var(--text-muted)]">
        These terms are specified by <strong className="text-white"><em>SMS</em></strong>. If you have any questions, please contact us before accepting.
      </p>
    </Modal>
  )
}

export default HostTermsModal
