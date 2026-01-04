import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
)

// Dev-only endpoint for quick role-based login
// POST /api/dev/login { role: 'guest' | 'host' | 'founder', name?: string }
export async function POST(request: NextRequest) {
  // CRITICAL: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Dev endpoints disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { role = 'guest', name } = await request.json()

    if (!['guest', 'host', 'founder'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be guest, host, or founder' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Dev phone numbers by role
    const devPhones: Record<string, string> = {
      guest: '+15550000001',
      host: '+15550000002',
      founder: '+15550000003',
    }

    const devNames: Record<string, string> = {
      guest: 'Dev Guest',
      host: 'Dev Host',
      founder: 'Dev Founder',
    }

    const phone = devPhones[role]
    const userName = name || devNames[role]

    // Upsert dev user
    const { data: user, error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          phone,
          name: userName,
          role,
          trust_score_overall: 100,
          trust_status: 'trusted',
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

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('sms_token', token, {
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
      message: `Logged in as ${role}: ${userName}`,
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
    usage: 'POST with { role: "guest" | "host" | "founder" }',
    accounts: [
      { role: 'guest', phone: '+15550000001', description: 'Regular user who attends spaces' },
      { role: 'host', phone: '+15550000002', description: 'Can create and manage spaces' },
      { role: 'founder', phone: '+15550000003', description: 'Full admin access' },
    ],
  })
}
