import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  const cookieStore = cookies()

  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.then(store => store.getAll())
        },
        setAll(cookiesToSet) {
          try {
            cookieStore.then(store => {
              cookiesToSet.forEach(({ name, value, options }) =>
                store.set(name, value, options)
              )
            })
          } catch {
            // Server Component - can't set cookies
          }
        },
      },
    }
  )
}

// Admin client with service role key for elevated permissions
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
