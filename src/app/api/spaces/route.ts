import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { schedulePocketLibanPrompts } from '@/lib/twilio/messages'

// GET /api/spaces - List spaces (optionally filter by host)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('host_id')

    let query = supabase
      .from('spaces')
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
    const spacesWithCounts = data?.map((space) => ({
      ...space,
      accepted_count: space.invitations?.filter((i: { status: string }) => i.status === 'accepted').length || 0,
      total_invited: space.invitations?.length || 0,
    }))

    return NextResponse.json({ spaces: spacesWithCounts })
  } catch (err) {
    console.error('Error fetching spaces:', err)
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 })
  }
}

// POST /api/spaces - Create a new space
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

    // Create the space
    const { data: space, error } = await supabase
      .from('spaces')
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
        status: 'open',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating space:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Schedule Pocket Liban prompts for the host
    const spaceDateTime = new Date(`${date}T${time}`)
    const prompts = schedulePocketLibanPrompts(space.id, spaceDateTime)

    // Insert prompts into database
    const { error: promptsError } = await supabase
      .from('host_prompts')
      .insert(prompts)

    if (promptsError) {
      console.error('Error scheduling prompts:', promptsError)
      // Don't fail space creation for this
    }

    return NextResponse.json({ space }, { status: 201 })
  } catch (err) {
    console.error('Error creating space:', err)
    return NextResponse.json({ error: 'Failed to create space' }, { status: 500 })
  }
}

// PATCH /api/spaces?id=xxx - Update space status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const adminSupabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('id')

    if (!spaceId) {
      return NextResponse.json({ error: 'Space ID required' }, { status: 400 })
    }

    // Get current space state before update (for comparison)
    const { data: currentSpace } = await supabase
      .from('spaces')
      .select('status, date, time, location_address')
      .eq('id', spaceId)
      .single()

    const body = await request.json()
    const { status, ...updates } = body

    // Validate status transition
    if (status) {
      const validStatuses = ['draft', 'open', 'full', 'confirmed', 'completed', 'canceled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
    }

    const { data: space, error } = await supabase
      .from('spaces')
      .update({
        ...(status && { status }),
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', spaceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating space:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get accepted guests for notifications
    const { data: acceptedInvitations } = await adminSupabase
      .from('invitations')
      .select('user_id')
      .eq('space_id', spaceId)
      .eq('status', 'accepted')

    const guestIds = acceptedInvitations?.map(inv => inv.user_id) || []

    // Notify guests if space was canceled
    if (status === 'canceled' && currentSpace?.status !== 'canceled' && guestIds.length > 0) {
      const notifications = guestIds.map(userId => ({
        user_id: userId,
        type: 'update',
        title: 'Space Canceled',
        message: `${space.name} has been canceled by the host. Any payment holds will be released.`,
        space_id: spaceId,
      }))

      await adminSupabase.from('notifications').insert(notifications)
    }

    // Notify guests if important details changed (date, time, location)
    const dateChanged = updates.date && updates.date !== currentSpace?.date
    const timeChanged = updates.time && updates.time !== currentSpace?.time
    const locationChanged = updates.location_address && updates.location_address !== currentSpace?.location_address

    if ((dateChanged || timeChanged || locationChanged) && guestIds.length > 0 && status !== 'canceled') {
      const changes: string[] = []
      if (dateChanged) changes.push('date')
      if (timeChanged) changes.push('time')
      if (locationChanged) changes.push('location')

      const notifications = guestIds.map(userId => ({
        user_id: userId,
        type: 'update',
        title: 'Space Updated',
        message: `${space.name} has been updated. The ${changes.join(' and ')} changed. Check the app for details.`,
        space_id: spaceId,
      }))

      await adminSupabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({ space })
  } catch (err) {
    console.error('Error updating space:', err)
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
  }
}
