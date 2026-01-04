import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/spaces/[id] - Get a single space by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Fetch space without joins (avoids schema cache issues)
    const { data: space, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !space) {
      console.error('Space not found:', error)
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      )
    }

    // Fetch host info separately
    let host = null
    if (space.host_id) {
      const { data: hostData } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', space.host_id)
        .single()
      host = hostData
    }

    // Get accepted count
    const { count } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('space_id', id)
      .eq('status', 'accepted')

    // Get guest names for display (simple query without joins)
    const { data: invitations } = await supabase
      .from('invitations')
      .select('user_id')
      .eq('space_id', id)
      .eq('status', 'accepted')
      .limit(5)

    // Fetch guest names separately if there are invitations
    let guests: { name: string }[] = []
    if (invitations && invitations.length > 0) {
      const userIds = invitations.map(inv => inv.user_id)
      const { data: users } = await supabase
        .from('users')
        .select('name')
        .in('id', userIds)
      guests = users?.map(u => ({ name: u.name || 'Guest' })) || []
    }

    return NextResponse.json({
      space: {
        ...space,
        host,
        accepted_count: count || 0,
        guests,
      }
    })
  } catch (err) {
    console.error('Error fetching space:', err)
    return NextResponse.json(
      { error: 'Failed to fetch space' },
      { status: 500 }
    )
  }
}
