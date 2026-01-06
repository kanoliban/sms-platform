import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createServerClient } from '@/lib/supabase/server'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

// GET /api/auth/me - Get current authenticated user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sms_auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    // Verify JWT token
    let payload
    try {
      const verified = await jwtVerify(token, getJwtSecret())
      payload = verified.payload
    } catch {
      // Invalid or expired token - clear cookies
      cookieStore.delete('sms_auth_token')
      cookieStore.delete('sms_user')
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    const userId = payload.userId as string

    // Fetch fresh user data from database
    const supabase = createServerClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      // User not found - clear cookies
      cookieStore.delete('sms_auth_token')
      cookieStore.delete('sms_user')
      return NextResponse.json(
        { user: null },
        { status: 200 }
      )
    }

    // Force logout check: if user was force logged out after this token was issued
    if (user.force_logout_at) {
      const tokenIssuedAt = payload.iat as number // Unix timestamp in seconds
      const forceLogoutTime = new Date(user.force_logout_at).getTime() / 1000
      if (forceLogoutTime > tokenIssuedAt) {
        // Token was issued before force logout - invalidate session
        cookieStore.delete('sms_auth_token')
        cookieStore.delete('sms_user')
        return NextResponse.json(
          { user: null },
          { status: 200 }
        )
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        intent: user.intent,
        user_intent: user.user_intent,
        onboarding_completed: user.onboarding_completed ?? true,
        onboarding_skipped: user.onboarding_skipped ?? false,
        onboarding_completed_at: user.onboarding_completed_at,
        tone_preference: user.tone_preference,
        trust_score_overall: user.trust_score_overall,
        trust_status: user.trust_status,
        spaces_attended: user.spaces_attended,
        spaces_hosted: user.spaces_hosted,
        no_shows: user.no_shows,
        created_at: user.created_at,
      },
    })
  } catch (err) {
    console.error('Error in /api/auth/me:', err)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}
