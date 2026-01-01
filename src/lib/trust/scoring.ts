import { createAdminClient } from '@/lib/supabase/server'
import type { User } from '@/lib/supabase/types'

// Trust score events and their deltas
export const TRUST_EVENTS = {
  // Positive events
  room_attended: { delta: 3, component: 'reliability' as const },
  feedback_submitted: { delta: 1, component: 'social' as const },
  positive_host_feedback: { delta: 3, component: 'social' as const },
  positive_guest_feedback: { delta: 2, component: 'social' as const },
  referred_by_trusted: { delta: 5, component: 'social' as const },

  // Negative events
  no_show: { delta: -15, component: 'reliability' as const },
  late_cancel: { delta: -5, component: 'reliability' as const },
  negative_host_feedback: { delta: -10, component: 'social' as const },
  agreement_violation: { delta: -20, component: 'safety' as const },
  phone_during_room: { delta: -3, component: 'social' as const },

  // Host-specific
  room_hosted: { delta: 5, component: 'reliability' as const },
  room_canceled_by_host: { delta: -8, component: 'reliability' as const },

  // Tenure (time-based)
  monthly_active: { delta: 1, component: 'tenure' as const },
} as const

export type TrustEventType = keyof typeof TRUST_EVENTS

// Component weights for overall score
const COMPONENT_WEIGHTS = {
  reliability: 0.35,
  social: 0.30,
  safety: 0.25,
  tenure: 0.10,
}

// Record a trust event and update scores
export async function recordTrustEvent(
  userId: string,
  eventType: TrustEventType,
  roomId?: string,
  notes?: string,
  customDelta?: number
): Promise<void> {
  const supabase = createAdminClient()
  const event = TRUST_EVENTS[eventType]
  const delta = customDelta ?? event.delta

  // Insert trust event
  await supabase.from('trust_events').insert({
    user_id: userId,
    event_type: eventType,
    delta,
    room_id: roomId,
    notes,
  })

  // Get current user scores
  const { data: user } = await supabase
    .from('users')
    .select('trust_reliability, trust_social, trust_safety, trust_tenure')
    .eq('id', userId)
    .single()

  if (!user) return

  // Update the specific component
  const componentField = `trust_${event.component}` as const
  const currentValue = user[componentField as keyof typeof user] as number
  const newValue = Math.max(0, Math.min(100, currentValue + delta))

  // Calculate new overall score
  const components = {
    reliability: event.component === 'reliability' ? newValue : user.trust_reliability,
    social: event.component === 'social' ? newValue : user.trust_social,
    safety: event.component === 'safety' ? newValue : user.trust_safety,
    tenure: event.component === 'tenure' ? newValue : user.trust_tenure,
  }

  const overallScore = Math.round(
    components.reliability * COMPONENT_WEIGHTS.reliability +
    components.social * COMPONENT_WEIGHTS.social +
    components.safety * COMPONENT_WEIGHTS.safety +
    components.tenure * COMPONENT_WEIGHTS.tenure
  )

  // Update user
  await supabase
    .from('users')
    .update({
      [componentField]: newValue,
      trust_score_overall: overallScore,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  // Check for status changes
  await checkTrustStatus(userId, overallScore)
}

// Check and update trust status based on score
async function checkTrustStatus(userId: string, overallScore: number): Promise<void> {
  const supabase = createAdminClient()

  let newStatus: 'new' | 'active' | 'suspended' | 'banned'

  if (overallScore < 20) {
    newStatus = 'banned'
  } else if (overallScore < 35) {
    newStatus = 'suspended'
  } else if (overallScore >= 50) {
    newStatus = 'active'
  } else {
    return // No change needed
  }

  await supabase
    .from('users')
    .update({ trust_status: newStatus })
    .eq('id', userId)
}

// Check if user can be invited to a room
export function canInviteToRoom(
  user: Pick<User, 'trust_score_overall' | 'trust_status' | 'no_shows'>,
  roomTone?: 'chill' | 'playful' | 'deep' | 'intense'
): { allowed: boolean; reason?: string } {
  // Banned users cannot attend
  if (user.trust_status === 'banned') {
    return { allowed: false, reason: 'User is banned' }
  }

  // Suspended users need founder approval
  if (user.trust_status === 'suspended') {
    return { allowed: false, reason: 'User is suspended - requires founder approval' }
  }

  // Too many no-shows
  if (user.no_shows >= 3) {
    return { allowed: false, reason: 'Too many no-shows' }
  }

  // Deep/intense rooms require higher trust
  if (roomTone === 'deep' || roomTone === 'intense') {
    if (user.trust_score_overall < 45) {
      return { allowed: false, reason: 'Trust score too low for this room type' }
    }
  }

  return { allowed: true }
}

// Check if user can host
export function canHost(
  user: Pick<User, 'trust_score_overall' | 'trust_status' | 'rooms_attended'>
): { allowed: boolean; reason?: string } {
  if (user.trust_status !== 'active') {
    return { allowed: false, reason: 'User must be in active status to host' }
  }

  if (user.trust_score_overall < 60) {
    return { allowed: false, reason: 'Trust score too low to host' }
  }

  if (user.rooms_attended < 2) {
    return { allowed: false, reason: 'Must attend at least 2 rooms before hosting' }
  }

  return { allowed: true }
}

// Get trust score display info
export function getTrustDisplay(score: number): {
  label: string
  color: string
  description: string
} {
  if (score >= 80) {
    return {
      label: 'Trusted',
      color: 'green',
      description: 'Highly trusted member of the community',
    }
  } else if (score >= 60) {
    return {
      label: 'Good Standing',
      color: 'blue',
      description: 'Active and reliable community member',
    }
  } else if (score >= 45) {
    return {
      label: 'Developing',
      color: 'yellow',
      description: 'Building trust through participation',
    }
  } else if (score >= 30) {
    return {
      label: 'Caution',
      color: 'orange',
      description: 'Limited access to certain rooms',
    }
  } else {
    return {
      label: 'Restricted',
      color: 'red',
      description: 'Access restricted due to trust issues',
    }
  }
}
