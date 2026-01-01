import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { schedulePocketLibanPrompts } from '@/lib/twilio/messages'

// GET /api/rooms - List rooms (optionally filter by host)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('host_id')

    let query = supabase
      .from('rooms')
      .select(`
        *,
        invitations (
          id,
          status
        )
      `)
      .order('date', { ascending: true })

    if (hostId) {
      query = query.eq('host_id', hostId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add invitation counts
    const roomsWithCounts = data?.map((room) => ({
      ...room,
      accepted_count: room.invitations?.filter((i: { status: string }) => i.status === 'accepted').length || 0,
      total_invited: room.invitations?.length || 0,
    }))

    return NextResponse.json({ rooms: roomsWithCounts })
  } catch (err) {
    console.error('Error fetching rooms:', err)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const {
      name,
      description,
      tone,
      date,
      time,
      duration_minutes,
      location_address,
      location_hint,
      capacity,
      price_cents,
    } = body

    // Validate required fields
    if (!name || !date || !time || !location_address || !capacity || price_cents === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For MVP, get host from localStorage phone (sent in body)
    // In production, this would use proper auth
    const hostPhone = body.host_phone
    let hostId = body.host_id

    if (!hostId && hostPhone) {
      // Look up or create user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', hostPhone)
        .single()

      if (existingUser) {
        hostId = existingUser.id
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            phone: hostPhone,
            role: 'host',
          })
          .select('id')
          .single()

        if (userError) {
          return NextResponse.json({ error: 'Failed to create host user' }, { status: 500 })
        }
        hostId = newUser.id
      }
    }

    if (!hostId) {
      return NextResponse.json({ error: 'Host ID required' }, { status: 400 })
    }

    // Create the room
    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        host_id: hostId,
        name,
        description: description || null,
        tone: tone || 'chill',
        date,
        time,
        duration_minutes: duration_minutes || 120,
        location_address,
        location_hint: location_hint || null,
        capacity,
        price_cents,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating room:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Schedule Pocket Liban prompts for the host
    const roomDateTime = new Date(`${date}T${time}`)
    const prompts = schedulePocketLibanPrompts(room.id, roomDateTime)

    // Insert prompts into database
    const { error: promptsError } = await supabase
      .from('host_prompts')
      .insert(prompts)

    if (promptsError) {
      console.error('Error scheduling prompts:', promptsError)
      // Don't fail room creation for this
    }

    return NextResponse.json({ room }, { status: 201 })
  } catch (err) {
    console.error('Error creating room:', err)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

// PATCH /api/rooms?id=xxx - Update room status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { status, ...updates } = body

    // Validate status transition
    if (status) {
      const validStatuses = ['draft', 'open', 'full', 'confirmed', 'completed', 'canceled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
    }

    const { data: room, error } = await supabase
      .from('rooms')
      .update({
        ...(status && { status }),
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      console.error('Error updating room:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room })
  } catch (err) {
    console.error('Error updating room:', err)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}
