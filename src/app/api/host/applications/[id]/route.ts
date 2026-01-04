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

// GET /api/host/applications/[id]
// Get single application details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden - Founder access required' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: application, error } = await supabase
      .from('host_applications')
      .select(`
        *,
        user:users!host_applications_user_id_fkey (*),
        terms:host_terms_versions!host_applications_terms_version_id_fkey (*),
        reviewer:users!host_applications_reviewed_by_fkey (id, name)
      `)
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ application })

  } catch (err) {
    console.error('Error fetching application:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/host/applications/[id]
// Approve or reject an application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden - Founder access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason, reviewNotes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 })
    }

    if (action === 'reject' && !rejectionReason?.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from('host_applications')
      .select('id, status, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({
        error: `Application has already been ${application.status}`
      }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update the application
    const { error: updateError } = await supabase
      .from('host_applications')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes?.trim() || null,
        rejection_reason: action === 'reject' ? rejectionReason.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating application:', updateError)
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }

    // If approved, update user role to 'host'
    // Note: The database trigger should handle this automatically,
    // but we'll do it here as a backup
    if (action === 'approve') {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          role: 'host',
          host_application_status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.user_id)

      if (userUpdateError) {
        console.error('Error updating user role:', userUpdateError)
        // Don't fail the request, the trigger should handle this
      }
    } else {
      // Update user's application status to rejected
      await supabase
        .from('users')
        .update({
          host_application_status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.user_id)
    }

    console.log(`Host application ${id} ${newStatus} by founder ${user.id}`)

    return NextResponse.json({
      success: true,
      message: `Application ${newStatus} successfully`,
      status: newStatus,
    })

  } catch (err) {
    console.error('Error processing application:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
