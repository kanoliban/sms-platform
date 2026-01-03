import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { checkVerificationCode, normalizePhoneNumber } from '@/lib/twilio/client'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sms-platform-secret-key-change-in-production'
)

// POST /api/auth/verify-code - Verify code via Twilio Verify and create session
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

    // Verify code with Twilio Verify
    let verificationResult
    try {
      verificationResult = await checkVerificationCode(normalizedPhone, code)
    } catch (error) {
      console.error('Verification check error:', error)
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    if (!verificationResult.valid) {
      return NextResponse.json(
        { error: verificationResult.status === 'pending' ? 'Invalid code' : 'Verification expired' },
        { status: 400 }
      )
    }

    // Get user from database
    const supabase = createServerClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', normalizedPhone)
      .single()

    if (userError || !user) {
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
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Set HTTP-only cookie with the token
    const cookieStore = await cookies()
    cookieStore.set('sms_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
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
        spaces_attended: user.spaces_attended,
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
