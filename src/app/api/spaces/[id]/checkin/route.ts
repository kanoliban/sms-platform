import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { normalizePhoneNumber } from '@/lib/twilio/client'

// POST /api/spaces/[id]/checkin - Check in a guest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spaceId } = await params
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const normalizedPhone = normalizePhoneNumber(phone)

    // Find the space
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .single()

    if (spaceError || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Check space status
    if (space.status !== 'confirmed' && space.status !== 'open' && space.status !== 'full') {
      return NextResponse.json(
        { error: 'This space is not currently accepting check-ins' },
        { status: 400 }
      )
    }

    // Find user by phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalizedPhone)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Phone number not found. Please see the host.' },
        { status: 404 }
      )
    }

    // Find invitation
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*')
      .eq('space_id', spaceId)
      .eq('user_id', user.id)
      .single()

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'No invitation found for this space. Please see the host.' },
        { status: 404 }
      )
    }

    // Check invitation status
    if (invitation.status !== 'accepted') {
      return NextResponse.json(
        { error: `Your invitation status is "${invitation.status}". Please see the host.` },
        { status: 400 }
      )
    }

    // Check if already checked in
    if (invitation.attended === true) {
      return NextResponse.json({
        message: "You're already checked in! Enjoy the space.",
        guestName: user.name,
        alreadyCheckedIn: true,
      })
    }

    // Mark as attended
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ attended: true })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Failed to update attendance:', updateError)
      return NextResponse.json(
        { error: 'Check-in failed. Please see the host.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "You're checked in! Welcome to the space.",
      guestName: user.name,
    })
  } catch (err) {
    console.error('Check-in error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please see the host.' },
      { status: 500 }
    )
  }
}

// GET /api/spaces/[id]/checkin - Get check-in status (for host)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spaceId } = await params
    const supabase = createAdminClient()

    // Get all invitations with attendance status
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        user:users (id, name, phone)
      `)
      .eq('space_id', spaceId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to get check-in status' }, { status: 500 })
    }

    const checkedIn = invitations?.filter((i) => i.attended === true).length || 0
    const totalAccepted = invitations?.length || 0

    return NextResponse.json({
      checkedIn,
      totalAccepted,
      guests: invitations?.map((i) => ({
        id: i.id,
        name: i.user?.name || 'Unknown',
        phone: i.user?.phone,
        checkedIn: i.attended === true,
      })),
    })
  } catch (err) {
    console.error('Get check-in status error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
