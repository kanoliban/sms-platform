import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendSms, normalizePhoneNumber } from '@/lib/twilio/client'

// Generate a 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST /api/auth/send-code - Send verification code via SMS
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

    // Generate verification code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const supabase = createServerClient()

    // Find or create user
    let userId: string

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .single()

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          phone: normalizedPhone,
          role: 'guest',
        })
        .select('id')
        .single()

      if (userError || !newUser) {
        console.error('Error creating user:', userError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
      userId = newUser.id
    }

    // Delete any existing codes for this phone
    await supabase
      .from('verification_codes')
      .delete()
      .eq('phone', normalizedPhone)

    // Store the new verification code
    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert({
        phone: normalizedPhone,
        code,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
      })

    if (codeError) {
      console.error('Error storing verification code:', codeError)
      return NextResponse.json(
        { error: 'Failed to generate code' },
        { status: 500 }
      )
    }

    // Send SMS with verification code
    const smsMessage = `Your SMS verification code is: ${code}\n\nThis code expires in 10 minutes.`

    try {
      await sendSms(normalizedPhone, smsMessage)
    } catch (smsError) {
      console.error('Error sending SMS:', smsError)
      // Clean up the code if SMS fails
      await supabase
        .from('verification_codes')
        .delete()
        .eq('phone', normalizedPhone)

      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // Don't expose phone in response for security
    })
  } catch (err) {
    console.error('Error in send-code:', err)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
