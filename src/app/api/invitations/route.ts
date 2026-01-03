import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendSms, normalizePhoneNumber } from '@/lib/twilio/client'
import { contractInviteMessage } from '@/lib/twilio/messages'
import type { Space, User } from '@/lib/supabase/types'

// GET /api/invitations - List invitations for a space
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('space_id')

    if (!spaceId) {
      return NextResponse.json({ error: 'Space ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        user:users (
          id,
          name,
          phone,
          trust_score_overall
        )
      `)
      .eq('space_id', spaceId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invitations: data })
  } catch (err) {
    console.error('Error fetching invitations:', err)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

// POST /api/invitations - Send an invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { space_id, phone } = body

    if (!space_id || !phone) {
      return NextResponse.json(
        { error: 'Space ID and phone number required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone)

    // Get the space
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select(`
        *,
        host:users!spaces_host_id_fkey (
          id,
          name,
          phone
        )
      `)
      .eq('id', space_id)
      .single()

    if (spaceError || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Check space status
    if (space.status !== 'open' && space.status !== 'draft') {
      return NextResponse.json(
        { error: 'Space is not accepting invitations' },
        { status: 400 }
      )
    }

    // Check capacity
    const { count: acceptedCount } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('space_id', space_id)
      .eq('status', 'accepted')

    if (acceptedCount && acceptedCount >= space.capacity) {
      return NextResponse.json(
        { error: 'Space is at capacity' },
        { status: 400 }
      )
    }

    // Find or create user for this phone
    let user: User | null = null

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalizedPhone)
      .single()

    if (existingUser) {
      user = existingUser
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          phone: normalizedPhone,
          role: 'guest',
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creating user:', userError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
      user = newUser
    }

    // TypeScript guard - should never happen due to early return above
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to resolve user' },
        { status: 500 }
      )
    }

    // Check for existing invitation
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('space_id', space_id)
      .eq('user_id', user.id)
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'User already invited to this space' },
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        space_id,
        user_id: user.id,
        status: 'pending',
        amount_cents: space.price_cents,
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Send SMS invitation
    const hostName = (space as Space & { host: Pick<User, 'id' | 'name' | 'phone'> }).host?.name || 'Your host'
    const smsMessage = contractInviteMessage({
      spaceName: space.name,
      hostName,
      date: new Date(space.date),
      time: space.time,
      locationHint: space.location_hint || 'Location TBA',
      priceDollars: space.price_cents / 100,
    })

    try {
      const messageId = await sendSms(normalizedPhone, smsMessage)

      // Update invitation with sent status
      await supabase
        .from('invitations')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', invitation.id)

      // Log the SMS conversation
      await supabase.from('sms_conversations').insert({
        user_id: user.id,
        direction: 'outbound',
        message: smsMessage,
        context: 'contract_invite',
        space_id: space_id,
      })

      return NextResponse.json({
        invitation: { ...invitation, status: 'sent' },
        messageId,
      }, { status: 201 })
    } catch (smsError) {
      console.error('Error sending SMS:', smsError)
      // Invitation created but SMS failed
      return NextResponse.json({
        invitation,
        warning: 'Invitation created but SMS failed to send',
      }, { status: 201 })
    }
  } catch (err) {
    console.error('Error creating invitation:', err)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}
