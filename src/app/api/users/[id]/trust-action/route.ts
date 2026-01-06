import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

type TrustAction = 'suspend' | 'ban' | 'reinstate'
type TrustStatus = 'new' | 'active' | 'suspended' | 'banned'

const VALID_TRANSITIONS: Record<TrustAction, TrustStatus[]> = {
  suspend: ['new', 'active'],
  ban: ['new', 'active', 'suspended'],
  reinstate: ['suspended', 'banned'],
}

const ACTION_TO_STATUS: Record<TrustAction, TrustStatus> = {
  suspend: 'suspended',
  ban: 'banned',
  reinstate: 'active',
}

async function getFounderFromToken(request: NextRequest): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies()
  let token = cookieStore.get('sms_auth_token')?.value

  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '')
    }
  }

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    const userId = payload.userId as string

    const supabase = createAdminClient()
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single()

    return user
  } catch {
    return null
  }
}

// POST /api/users/[id]/trust-action
// Suspend, ban, or reinstate a user (founder only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const founder = await getFounderFromToken(request)
    if (!founder) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (founder.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden - Founder access required' }, { status: 403 })
    }

    const { id: targetUserId } = await params
    const body = await request.json()
    const { action, reason } = body as { action: TrustAction; reason?: string }

    // Validate action
    if (!action || !['suspend', 'ban', 'reinstate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "suspend", "ban", or "reinstate"' },
        { status: 400 }
      )
    }

    // Require reason for suspend and ban
    if ((action === 'suspend' || action === 'ban') && !reason?.trim()) {
      return NextResponse.json(
        { error: `Reason is required when ${action}ing a user` },
        { status: 400 }
      )
    }

    // Prevent self-action
    if (targetUserId === founder.id) {
      return NextResponse.json(
        { error: 'Cannot perform trust actions on yourself' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get target user
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('id, name, phone, trust_status, role')
      .eq('id', targetUserId)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot take action on another founder
    if (targetUser.role === 'founder') {
      return NextResponse.json(
        { error: 'Cannot perform trust actions on founders' },
        { status: 403 }
      )
    }

    const currentStatus = (targetUser.trust_status || 'active') as TrustStatus
    const validFromStatuses = VALID_TRANSITIONS[action]

    if (!validFromStatuses.includes(currentStatus)) {
      return NextResponse.json(
        { error: `Cannot ${action} a user with status "${currentStatus}"` },
        { status: 400 }
      )
    }

    const newStatus = ACTION_TO_STATUS[action]
    const now = new Date().toISOString()

    // Update user status
    const updateData: Record<string, unknown> = {
      trust_status: newStatus,
      updated_at: now,
    }

    // Force logout for suspend and ban
    if (action === 'suspend' || action === 'ban') {
      updateData.force_logout_at = now
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', targetUserId)

    if (updateError) {
      console.error('Error updating user trust status:', updateError)
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
    }

    // Log the action to trust_events
    const { error: logError } = await supabase
      .from('trust_events')
      .insert({
        user_id: targetUserId,
        action,
        reason: reason?.trim() || null,
        performed_by: founder.id,
        previous_status: currentStatus,
        new_status: newStatus,
      })

    if (logError) {
      console.error('Error logging trust event:', logError)
      // Don't fail the request, the action was successful
    }

    console.log(`Trust action: ${action} user ${targetUserId} (${targetUser.name || targetUser.phone}) by founder ${founder.id}. Status: ${currentStatus} → ${newStatus}`)

    // Get updated user for response
    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, name, phone, trust_status, trust_score_overall, no_shows')
      .eq('id', targetUserId)
      .single()

    return NextResponse.json({
      success: true,
      message: `User ${action === 'reinstate' ? 'reinstated' : action + 'd'} successfully`,
      user: updatedUser,
      previousStatus: currentStatus,
      newStatus,
    })

  } catch (err) {
    console.error('Error in trust action:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
