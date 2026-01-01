import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendSms, normalizePhoneNumber } from '@/lib/twilio/client'
import { contractInviteMessage } from '@/lib/twilio/messages'
import type { Room, User } from '@/lib/supabase/types'

// GET /api/invitations - List invitations for a room
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
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
      .eq('room_id', roomId)
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

    const { room_id, phone } = body

    if (!room_id || !phone) {
      return NextResponse.json(
        { error: 'Room ID and phone number required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone)

    // Get the room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select(`
        *,
        host:users!rooms_host_id_fkey (
          id,
          name,
          phone
        )
      `)
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check room status
    if (room.status !== 'open' && room.status !== 'draft') {
      return NextResponse.json(
        { error: 'Room is not accepting invitations' },
        { status: 400 }
      )
    }

    // Check capacity
    const { count: acceptedCount } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room_id)
      .eq('status', 'accepted')

    if (acceptedCount && acceptedCount >= room.capacity) {
      return NextResponse.json(
        { error: 'Room is at capacity' },
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
      .eq('room_id', room_id)
      .eq('user_id', user.id)
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'User already invited to this room' },
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        room_id,
        user_id: user.id,
        status: 'pending',
        amount_cents: room.price_cents,
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
    const hostName = (room as Room & { host: Pick<User, 'id' | 'name' | 'phone'> }).host?.name || 'Your host'
    const smsMessage = contractInviteMessage({
      roomName: room.name,
      hostName,
      date: new Date(room.date),
      time: room.time,
      locationHint: room.location_hint || 'Location TBA',
      priceDollars: room.price_cents / 100,
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
        room_id: room_id,
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
