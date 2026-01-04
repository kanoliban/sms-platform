import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

// POST /api/host/apply
// Upgrades a user's role to 'host' after completing onboarding
export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    let userId: string

    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      userId = payload.userId as string
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      agreedToPhilosophy,
      agreedToCommitments,
      hostName
    } = body

    // Validate agreements
    if (!agreedToPhilosophy || !agreedToCommitments) {
      return NextResponse.json({
        error: 'You must agree to both the SMS philosophy and host commitments'
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check user exists and isn't already a host/founder
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, name')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'host' || user.role === 'founder') {
      return NextResponse.json({
        message: 'Already a host',
        role: user.role
      })
    }

    // Update user to host role
    const updateData: { role: 'host'; name?: string } = { role: 'host' }

    // Optionally update name if provided and user doesn't have one
    if (hostName && !user.name) {
      updateData.name = hostName
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('Error upgrading user to host:', updateError)
      return NextResponse.json({ error: 'Failed to upgrade role' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome to the SMS host community!',
      role: 'host'
    })

  } catch (err) {
    console.error('Host application error:', err)
    return NextResponse.json({ error: 'Application failed' }, { status: 500 })
  }
}
