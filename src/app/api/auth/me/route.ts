import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createServerClient } from '@/lib/supabase/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sms-platform-secret-key-change-in-production'
)

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
      const verified = await jwtVerify(token, JWT_SECRET)
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

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        intent: user.intent,
        tone_preference: user.tone_preference,
        trust_score_overall: user.trust_score_overall,
        trust_status: user.trust_status,
        rooms_attended: user.rooms_attended,
        rooms_hosted: user.rooms_hosted,
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
