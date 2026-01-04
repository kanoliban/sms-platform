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

async function getUserFromToken(request: NextRequest): Promise<{ id: string; role: string } | null> {
  // First try to get token from cookie (primary method)
  const cookieStore = await cookies()
  let token = cookieStore.get('sms_auth_token')?.value

  // Fall back to Authorization header (for API testing)
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

    // Get user role
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

// GET /api/host/applications
// Returns all host applications (founder only)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only founders can view all applications
    if (user.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden - Founder access required' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Get applications with user and terms details
    let query = supabase
      .from('host_applications')
      .select(`
        id,
        status,
        signature_name,
        signature_timestamp,
        signature_ip,
        created_at,
        reviewed_at,
        review_notes,
        rejection_reason,
        user:users!host_applications_user_id_fkey (
          id,
          name,
          phone,
          email,
          trust_score_overall,
          trust_status,
          spaces_attended,
          no_shows,
          created_at
        ),
        terms:host_terms_versions!host_applications_terms_version_id_fkey (
          id,
          version,
          title
        ),
        reviewer:users!host_applications_reviewed_by_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    // Get counts by status
    const { data: counts } = await supabase
      .from('host_applications')
      .select('status')

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      all: counts?.length || 0,
    }

    counts?.forEach(app => {
      if (app.status === 'pending') statusCounts.pending++
      else if (app.status === 'approved') statusCounts.approved++
      else if (app.status === 'rejected') statusCounts.rejected++
    })

    return NextResponse.json({
      applications,
      counts: statusCounts,
    })

  } catch (err) {
    console.error('Error in GET /api/host/applications:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
