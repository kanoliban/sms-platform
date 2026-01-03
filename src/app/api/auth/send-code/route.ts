import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendVerificationCode, normalizePhoneNumber } from '@/lib/twilio/client'

// POST /api/auth/send-code - Send verification code via Twilio Verify
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    const supabase = createServerClient()

    // Find or create user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .single()

    if (!existingUser) {
      // Create new user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          phone: normalizedPhone,
          role: 'guest',
        })

      if (userError) {
        console.error('Error creating user:', userError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
    }

    // Send verification via Twilio Verify (handles code generation, SMS delivery, and expiration)
    try {
      await sendVerificationCode(normalizedPhone)
    } catch (smsError) {
      console.error('Error sending verification:', smsError)
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
    })
  } catch (err) {
    console.error('Error in send-code:', err)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
