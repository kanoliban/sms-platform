import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendVerificationCode, normalizePhoneNumber } from '@/lib/twilio/client'
import { checkOtpRateLimit } from '@/lib/rate-limit'

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

    // Check rate limit (5 requests per 10 minutes per phone)
    const rateLimit = await checkOtpRateLimit(normalizedPhone)
    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'Too many verification requests. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
          },
        }
      )
    }
    const supabase = createServerClient()

    // Find or create user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .single()

    if (!existingUser) {
      // Create new user with onboarding_completed = false
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          phone: normalizedPhone,
          role: 'guest',
          onboarding_completed: false,
        })
        .select('id')
        .single()

      if (userError) {
        console.error('Error creating user:', userError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      // Check if this phone was a lead and mark as converted
      if (newUser) {
        const { error: leadError } = await supabase
          .from('leads')
          .update({
            status: 'converted',
            converted_user_id: newUser.id,
            converted_at: new Date().toISOString(),
          })
          .eq('phone', normalizedPhone.replace(/\D/g, ''))

        if (leadError) {
          // Log but don't fail - lead conversion is not critical
          console.error('Error updating lead:', leadError)
        }
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
