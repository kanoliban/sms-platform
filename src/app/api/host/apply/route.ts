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

// Helper to get user ID from token (checks both cookie and Authorization header)
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
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
    return payload.userId as string
  } catch {
    return null
  }
}

// GET /api/host/apply
// Returns current host terms and user's application status
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get active host terms
    const { data: terms, error: termsError } = await supabase
      .from('host_terms_versions')
      .select('id, version, title, content, summary')
      .eq('is_active', true)
      .single()

    if (termsError) {
      console.error('Error fetching host terms:', termsError)
      return NextResponse.json({ error: 'Failed to fetch host terms' }, { status: 500 })
    }

    // Get user's application status (if any)
    const { data: application } = await supabase
      .from('host_applications')
      .select('id, status, created_at, rejection_reason')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get user's current role
    const { data: user } = await supabase
      .from('users')
      .select('role, name, host_application_status')
      .eq('id', userId)
      .single()

    // Determine if user can apply
    const isAlreadyHost = user?.role === 'host' || user?.role === 'founder'
    const hasPendingApplication = application?.status === 'pending'
    const canApply = !isAlreadyHost && !hasPendingApplication

    return NextResponse.json({
      terms,
      application: application || null,
      user: user || null,
      canApply,
    })

  } catch (err) {
    console.error('Error in GET /api/host/apply:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/host/apply
// Submit a host application with e-sign compliance
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { termsVersionId, signatureName } = body

    // Validate required fields
    if (!termsVersionId || !signatureName) {
      return NextResponse.json({
        error: 'Terms version ID and signature name are required'
      }, { status: 400 })
    }

    // Validate signature name (not empty, reasonable length)
    const trimmedSignature = signatureName.trim()
    if (trimmedSignature.length < 2 || trimmedSignature.length > 255) {
      return NextResponse.json({
        error: 'Signature name must be between 2 and 255 characters'
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify user exists and isn't already a host/founder
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'host' || user.role === 'founder') {
      return NextResponse.json({
        error: 'You are already a host',
        status: 'approved',
        role: user.role
      }, { status: 400 })
    }

    // Verify the terms version exists and is active
    const { data: terms, error: termsError } = await supabase
      .from('host_terms_versions')
      .select('id, version')
      .eq('id', termsVersionId)
      .eq('is_active', true)
      .single()

    if (termsError || !terms) {
      return NextResponse.json({
        error: 'Invalid or inactive terms version'
      }, { status: 400 })
    }

    // Check for existing pending application
    const { data: existingApp } = await supabase
      .from('host_applications')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (existingApp) {
      return NextResponse.json({
        error: 'You already have a pending application',
        applicationId: existingApp.id,
        status: 'pending'
      }, { status: 400 })
    }

    // Get IP address and user agent for e-sign compliance
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const signatureIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
    const signatureUserAgent = request.headers.get('user-agent') || 'unknown'

    // Create the host application
    const { data: application, error: insertError } = await supabase
      .from('host_applications')
      .insert({
        user_id: userId,
        terms_version_id: termsVersionId,
        signature_name: trimmedSignature,
        signature_timestamp: new Date().toISOString(),
        signature_ip: signatureIp,
        signature_user_agent: signatureUserAgent,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single()

    if (insertError) {
      console.error('Error creating host application:', insertError)

      // Check for unique constraint violation (already applied with this terms version)
      if (insertError.code === '23505') {
        return NextResponse.json({
          error: 'You have already applied with these terms'
        }, { status: 400 })
      }

      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    // Log successful application
    console.log(`Host application submitted: userId=${userId}, applicationId=${application.id}`)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.created_at,
      }
    })

  } catch (err) {
    console.error('Host application error:', err)
    return NextResponse.json({ error: 'Application failed' }, { status: 500 })
  }
}
