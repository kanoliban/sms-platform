import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { normalizePhoneNumber } from '@/lib/twilio/client'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

// Secret key for JWT signing (should be in env vars)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sms-platform-secret-key-change-in-production'
)

// POST /api/auth/verify-code - Verify code and create session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone and code required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    const supabase = createServerClient()

    // Find the verification code
    const { data: verificationData, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*, user:users(*)')
      .eq('phone', normalizedPhone)
      .eq('code', code)
      .single()

    if (fetchError || !verificationData) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Check if code is expired
    if (new Date(verificationData.expires_at) < new Date()) {
      // Delete expired code
      await supabase
        .from('verification_codes')
        .delete()
        .eq('id', verificationData.id)

      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      )
    }

    // Code is valid - delete it (one-time use)
    await supabase
      .from('verification_codes')
      .delete()
      .eq('id', verificationData.id)

    // Get user data
    const user = verificationData.user

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      phone: normalizedPhone,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Token expires in 7 days
      .sign(JWT_SECRET)

    // Set HTTP-only cookie with the token
    const cookieStore = await cookies()
    cookieStore.set('sms_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    })

    // Also set a non-httpOnly cookie for client-side user info
    cookieStore.set('sms_user', JSON.stringify({
      id: user.id,
      name: user.name,
      phone: normalizedPhone,
      role: user.role,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: normalizedPhone,
        role: user.role,
        intent: user.intent,
        tone_preference: user.tone_preference,
        trust_score_overall: user.trust_score_overall,
        rooms_attended: user.rooms_attended,
      },
    })
  } catch (err) {
    console.error('Error in verify-code:', err)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
