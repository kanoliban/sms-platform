import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/auth/logout - Clear session
export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear auth cookies
    cookieStore.delete('sms_auth_token')
    cookieStore.delete('sms_user')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in logout:', err)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
