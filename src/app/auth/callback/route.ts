import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const authUser = data.user
      const adminClient = createAdminClient()

      // Check if user exists in our users table
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single()

      if (!existingUser) {
        // Create user in our users table
        await adminClient.from('users').insert({
          auth_id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          role: 'guest',
        })
      }
    }
  }

  // Redirect to the dashboard or home page after login
  return NextResponse.redirect(`${origin}/`)
}
