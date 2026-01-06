import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // Check for custom redirect from cookie (set by LoginModal)
  const cookieStore = await cookies()
  const authRedirect = cookieStore.get('auth_redirect')?.value
  const customRedirect = authRedirect ? decodeURIComponent(authRedirect) : null

  let isNewUser = false

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const authUser = data.user
      const adminClient = createAdminClient()

      // Check if user exists in our users table
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id, onboarding_completed')
        .eq('auth_id', authUser.id)
        .single()

      if (!existingUser) {
        // Create user in our users table with onboarding_completed = false
        await adminClient.from('users').insert({
          auth_id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          role: 'guest',
          onboarding_completed: false,
        })
        isNewUser = true
      } else if (existingUser.onboarding_completed === false) {
        // Existing user who hasn't completed onboarding
        isNewUser = true
      }
    }
  }

  // Clear the auth_redirect cookie
  const response = customRedirect
    ? NextResponse.redirect(`${origin}${customRedirect}`)
    : isNewUser
      ? NextResponse.redirect(`${origin}/onboarding`)
      : NextResponse.redirect(`${origin}/discover`)

  // Clear the cookie
  response.cookies.delete('auth_redirect')

  return response
}
