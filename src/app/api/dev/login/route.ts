import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
)

// Dev accounts configuration
const DEV_ACCOUNTS = {
  guest: [
    { phone: '+15550000001', name: 'Alex Guest' },
    { phone: '+15550000011', name: 'Jordan Guest' },
    { phone: '+15550000021', name: 'Riley Guest' },
  ],
  host: [
    { phone: '+15550000002', name: 'Sam Host' },
    { phone: '+15550000012', name: 'Morgan Host' },
    { phone: '+15550000022', name: 'Casey Host' },
  ],
  founder: [
    { phone: '+15550000003', name: 'Dev Founder' },
  ],
} as const satisfies Record<string, Array<{ phone: string; name: string }>>

// Dev-only endpoint for quick role-based login
// POST /api/dev/login { role: 'guest' | 'guest:2' | 'host:3' | 'founder', name?: string }
export async function POST(request: NextRequest) {
  // CRITICAL: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Dev endpoints disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { role: roleInput = 'guest', name, onboarding_skipped = false } = await request.json()

    // Parse role and variant (e.g., "guest", "guest:2", "host:3")
    const [baseRole, variantStr] = roleInput.includes(':')
      ? roleInput.split(':')
      : [roleInput, '1']

    if (!['guest', 'host', 'founder'].includes(baseRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be guest, host, or founder' },
        { status: 400 }
      )
    }

    const accounts = DEV_ACCOUNTS[baseRole as keyof typeof DEV_ACCOUNTS]
    if (!accounts) {
      return NextResponse.json(
        { error: 'Invalid role configuration' },
        { status: 500 }
      )
    }
    const variant = Math.max(1, Math.min(parseInt(variantStr) || 1, accounts.length))
    const account = accounts[variant - 1]
    if (!account) {
      return NextResponse.json(
        { error: 'Invalid account variant' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const phone = account.phone
    const userName = name || account.name

    // Upsert dev user
    const { data: user, error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          phone,
          name: userName,
          role: baseRole,
          trust_score_overall: 100,
          trust_status: 'active',
          onboarding_completed: !onboarding_skipped,
          onboarding_skipped: onboarding_skipped,
        },
        { onConflict: 'phone' }
      )
      .select()
      .single()

    if (upsertError) {
      console.error('Dev login upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to create dev user' },
        { status: 500 }
      )
    }

    // Create JWT
    const token = await new SignJWT({ userId: user.id, phone: user.phone })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Set cookie (must match the name used in auth-context and verify-code)
    const cookieStore = await cookies()
    cookieStore.set('sms_auth_token', token, {
      httpOnly: true,
      secure: false, // Dev-only route, always insecure
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token, // Include token for API testing
      message: `Logged in as ${baseRole}: ${userName}`,
    })
  } catch (error) {
    console.error('Dev login error:', error)
    return NextResponse.json(
      { error: 'Dev login failed' },
      { status: 500 }
    )
  }
}

// GET /api/dev/login - Show available dev accounts
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Dev endpoints disabled in production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: 'Dev Login API',
    usage: 'POST with { role: "guest" | "guest:2" | "host:3" | "founder" }',
    accounts: {
      guest: DEV_ACCOUNTS.guest.map((acc, i) => ({
        variant: i + 1,
        role: `guest${i > 0 ? `:${i + 1}` : ''}`,
        ...acc,
        description: 'Regular user who attends rooms',
      })),
      host: DEV_ACCOUNTS.host.map((acc, i) => ({
        variant: i + 1,
        role: `host${i > 0 ? `:${i + 1}` : ''}`,
        ...acc,
        description: 'Can create and manage rooms',
      })),
      founder: DEV_ACCOUNTS.founder.map((acc, i) => ({
        variant: i + 1,
        role: `founder${i > 0 ? `:${i + 1}` : ''}`,
        ...acc,
        description: 'Full admin access',
      })),
    },
  })
}

// DELETE /api/dev/login - Reset dev user for testing
// Clears host applications and resets role to guest
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Dev endpoints disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find the user
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (findError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete all host applications for this user
    const { error: deleteError } = await supabase
      .from('host_applications')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting applications:', deleteError)
    }

    // Reset user role to guest
    const { error: updateError } = await supabase
      .from('users')
      .update({
        role: 'guest',
        host_application_status: null,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error resetting user:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: `Reset user ${phone} - cleared applications and set role to guest`,
    })
  } catch (error) {
    console.error('Dev reset error:', error)
    return NextResponse.json(
      { error: 'Reset failed' },
      { status: 500 }
    )
  }
}
