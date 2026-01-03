import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'

// GET /api/blasts?space_id=xxx - Get blast history for a space
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('space_id')

    if (!spaceId) {
      return NextResponse.json({ error: 'space_id required' }, { status: 400 })
    }

    const { data: blasts, error } = await supabase
      .from('blasts')
      .select(`
        *,
        sent_by_user:users!blasts_sent_by_fkey (
          id,
          name
        )
      `)
      .eq('space_id', spaceId)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('Error fetching blasts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blasts: blasts || [] })
  } catch (err) {
    console.error('Error fetching blasts:', err)
    return NextResponse.json({ error: 'Failed to fetch blasts' }, { status: 500 })
  }
}

// POST /api/blasts - Send a blast to guests
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { space_id, message, recipient_filter, sent_by } = body

    if (!space_id || !message || !sent_by) {
      return NextResponse.json(
        { error: 'space_id, message, and sent_by are required' },
        { status: 400 }
      )
    }

    const filter = recipient_filter || 'all'

    // Get the space to verify it exists
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('id, name, host_id')
      .eq('id', space_id)
      .single()

    if (spaceError || !space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Get recipients based on filter
    let query = supabase
      .from('invitations')
      .select(`
        id,
        status,
        user:users (
          id,
          name,
          phone
        )
      `)
      .eq('space_id', space_id)

    if (filter === 'confirmed') {
      query = query.eq('status', 'accepted')
    } else if (filter === 'invited') {
      query = query.in('status', ['sent', 'pending'])
    }
    // 'all' = no additional filter

    const { data: invitations, error: invError } = await query

    if (invError) {
      console.error('Error fetching invitations:', invError)
      return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 })
    }

    // Send SMS to each recipient with a phone number
    // Note: Supabase returns joined relations as arrays, so we access [0]
    let sentCount = 0
    const errors: string[] = []

    for (const invitation of invitations || []) {
      const userArr = invitation.user as { id: string; name: string | null; phone: string }[] | null
      const user = userArr?.[0]
      if (!user?.phone) continue

      try {
        await sendSms(user.phone, message)

        // Log the conversation
        await supabase.from('sms_conversations').insert({
          user_id: user.id,
          direction: 'outbound',
          message,
          context: 'blast',
          space_id: space_id,
        })

        sentCount++
      } catch (err) {
        console.error(`Failed to send to ${user.phone}:`, err)
        errors.push(user.phone)
      }
    }

    // Record the blast
    const { data: blast, error: blastError } = await supabase
      .from('blasts')
      .insert({
        space_id,
        sent_by,
        message,
        recipient_filter: filter,
        recipient_count: sentCount,
      })
      .select()
      .single()

    if (blastError) {
      console.error('Error recording blast:', blastError)
      // Don't fail - SMS were already sent
    }

    return NextResponse.json({
      success: true,
      blast,
      sent: sentCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Error sending blast:', err)
    return NextResponse.json({ error: 'Failed to send blast' }, { status: 500 })
  }
}
