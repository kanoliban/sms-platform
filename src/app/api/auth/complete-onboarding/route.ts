import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

// POST /api/auth/complete-onboarding - Save user intent and mark onboarding complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { intent, skipped } = body

    // Validate intent
    if (!intent || !['attend', 'host', 'both'].includes(intent)) {
      return NextResponse.json(
        { error: 'Invalid intent. Must be attend, host, or both.' },
        { status: 400 }
      )
    }

    // Get user from JWT token
    const cookieStore = await cookies()
    const token = cookieStore.get('sms_auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      userId = payload.userId as string
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Update user in database
    const supabase = createServerClient()
    const { error: updateError } = await supabase
      .from('users')
      .update({
        user_intent: intent,
        onboarding_completed: true,
        onboarding_skipped: skipped || false,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user onboarding:', updateError)
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      intent,
      skipped: skipped || false,
    })
  } catch (err) {
    console.error('Error in complete-onboarding:', err)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
