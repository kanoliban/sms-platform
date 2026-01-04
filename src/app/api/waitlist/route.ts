import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/waitlist?room_id=xxx - Get waitlist for a room
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')
    const userId = searchParams.get('user_id')

    if (!roomId && !userId) {
      return NextResponse.json({ error: 'room_id or user_id required' }, { status: 400 })
    }

    let query = supabase
      .from('waitlist')
      .select(`
        *,
        user:users (
          id,
          name,
          phone
        ),
        room:rooms (
          id,
          name,
          date,
          time
        )
      `)
      .eq('status', 'waiting')
      .order('position', { ascending: true })

    if (roomId) {
      query = query.eq('room_id', roomId)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: waitlist, error } = await query

    if (error) {
      console.error('Error fetching waitlist:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ waitlist: waitlist || [] })
  } catch (err) {
    console.error('Error fetching waitlist:', err)
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 })
  }
}

// POST /api/waitlist - Add user to waitlist
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { room_id, user_id } = body

    if (!room_id || !user_id) {
      return NextResponse.json({ error: 'room_id and user_id required' }, { status: 400 })
    }

    // Check if room exists and is full
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, capacity, status')
      .eq('id', room_id)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status !== 'open') {
      return NextResponse.json({ error: 'Room is not accepting guests' }, { status: 400 })
    }

    // Count current accepted invitations
    const { count: acceptedCount } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room_id)
      .eq('status', 'accepted')

    if ((acceptedCount || 0) < room.capacity) {
      return NextResponse.json({
        error: 'Room still has available spots. No need for waitlist.'
      }, { status: 400 })
    }

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, status')
      .eq('room_id', room_id)
      .eq('user_id', user_id)
      .single()

    if (existing) {
      if (existing.status === 'waiting') {
        return NextResponse.json({ error: 'Already on waitlist' }, { status: 400 })
      }
      // Re-add if previously canceled/expired
      const { error: updateError } = await supabase
        .from('waitlist')
        .update({ status: 'waiting', invited_at: null })
        .eq('id', existing.id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Re-added to waitlist',
        waitlist_id: existing.id
      })
    }

    // Get next position
    const { data: lastPosition } = await supabase
      .from('waitlist')
      .select('position')
      .eq('room_id', room_id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (lastPosition?.position || 0) + 1

    // Add to waitlist
    const { data: entry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        room_id,
        user_id,
        position: nextPosition,
        status: 'waiting'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error adding to waitlist:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Added to waitlist',
      position: nextPosition,
      waitlist_id: entry.id
    }, { status: 201 })
  } catch (err) {
    console.error('Error adding to waitlist:', err)
    return NextResponse.json({ error: 'Failed to add to waitlist' }, { status: 500 })
  }
}

// DELETE /api/waitlist - Remove from waitlist (cancel)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const waitlistId = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!waitlistId || !userId) {
      return NextResponse.json({ error: 'id and user_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('waitlist')
      .update({ status: 'canceled' })
      .eq('id', waitlistId)
      .eq('user_id', userId) // Ensure user can only cancel their own

    if (error) {
      console.error('Error canceling waitlist entry:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Removed from waitlist' })
  } catch (err) {
    console.error('Error canceling waitlist:', err)
    return NextResponse.json({ error: 'Failed to cancel waitlist entry' }, { status: 500 })
  }
}
