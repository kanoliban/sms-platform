import { createAdminClient } from '@/lib/supabase/server'

interface RateLimitConfig {
  key: string          // Unique identifier (e.g., phone number, IP, user ID)
  limit: number        // Max requests allowed
  windowMs: number     // Time window in milliseconds
  identifier: string   // Type of rate limit (e.g., 'otp', 'invite')
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: Date
}

/**
 * Check and update rate limit for a given key
 * Uses Supabase as backing store for serverless compatibility
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { key, limit, windowMs, identifier } = config
  const supabase = createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMs)

  // Composite key for this rate limit
  const rateLimitKey = `${identifier}:${key}`

  // Clean up old entries and count recent requests
  const { data: entries, error: fetchError } = await supabase
    .from('rate_limits')
    .select('id, created_at')
    .eq('key', rateLimitKey)
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('Rate limit fetch error:', fetchError)
    // Fail open on error - allow the request
    return { success: true, remaining: limit - 1, resetAt: new Date(now.getTime() + windowMs) }
  }

  const count = entries?.length || 0

  // Calculate reset time (when the oldest entry in window expires)
  const oldestEntry = entries?.[0]
  const resetAt = oldestEntry
    ? new Date(new Date(oldestEntry.created_at).getTime() + windowMs)
    : new Date(now.getTime() + windowMs)

  // Check if over limit
  if (count >= limit) {
    return { success: false, remaining: 0, resetAt }
  }

  // Record this request
  const { error: insertError } = await supabase
    .from('rate_limits')
    .insert({ key: rateLimitKey })

  if (insertError) {
    console.error('Rate limit insert error:', insertError)
    // Still allow the request on insert failure
  }

  return { success: true, remaining: limit - count - 1, resetAt }
}

/**
 * Clean up old rate limit entries (run periodically via cron)
 */
export async function cleanupRateLimits(): Promise<number> {
  const supabase = createAdminClient()
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('rate_limits')
    .delete()
    .lt('created_at', hourAgo.toISOString())
    .select('id')

  if (error) {
    console.error('Rate limit cleanup error:', error)
    return 0
  }

  return data?.length || 0
}

// Pre-configured rate limiters

/**
 * Rate limit for OTP requests: 5 requests per 10 minutes per phone
 */
export async function checkOtpRateLimit(phone: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: phone,
    limit: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
    identifier: 'otp',
  })
}

/**
 * Rate limit for invitation sends: 50 per hour per user
 */
export async function checkInviteRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: userId,
    limit: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    identifier: 'invite',
  })
}

/**
 * Rate limit for API requests: 100 per minute per IP
 */
export async function checkApiRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: ip,
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'api',
  })
}
