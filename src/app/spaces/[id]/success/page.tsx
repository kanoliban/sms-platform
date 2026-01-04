'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { PageContainer } from '@/components/layout'

export default function RSVPSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const spaceId = typeof params.id === 'string' ? params.id : ''
  const invitationId = searchParams.get('invitation')

  const [spaceName, setSpaceName] = useState<string>('')

  useEffect(() => {
    async function loadSpace() {
      try {
        const res = await fetch(`/api/spaces/${spaceId}`)
        if (res.ok) {
          const data = await res.json()
          setSpaceName(data.space?.name || 'the space')
        }
      } catch {
        // Ignore errors, just show generic message
      }
    }
    if (spaceId) {
      loadSpace()
    }
  }, [spaceId])

  return (
    <PageContainer>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="text-6xl mb-6">
            <span role="img" aria-label="celebration">🎉</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            You're In!
          </h1>

          <p className="text-[var(--text-secondary)] mb-6">
            Your spot for {spaceName || 'this space'} is confirmed.
            We'll send you the full address 24 hours before the event.
          </p>

          <div className="space-y-3">
            <Link href={`/spaces/${spaceId}`}>
              <Button variant="primary" className="w-full">
                View Space Details
              </Button>
            </Link>

            <Link href="/my-spaces">
              <Button variant="ghost" className="w-full">
                View My Spaces
              </Button>
            </Link>
          </div>

          {invitationId && (
            <p className="text-xs text-[var(--text-muted)] mt-6">
              Confirmation: {invitationId.slice(0, 8)}...
            </p>
          )}
        </Card>
      </div>
    </PageContainer>
  )
}
