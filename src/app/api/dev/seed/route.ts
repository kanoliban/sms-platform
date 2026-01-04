import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Deterministic UUIDs for test data (so we can upsert/delete them)
const TEST_IDS = {
  host: '00000000-0000-0000-0000-000000000001',
  guests: [
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000015',
  ],
  spaces: {
    gapAlert: '00000000-0000-0000-0000-000000000101',
    waitlist: '00000000-0000-0000-0000-000000000102',
    payment: '00000000-0000-0000-0000-000000000103',
    digest: '00000000-0000-0000-0000-000000000104',
    feedback: '00000000-0000-0000-0000-000000000105',
  },
}

// POST /api/dev/seed - Create test data for cron testing
// Only works in development or with CRON_SECRET
export async function POST(request: NextRequest) {
  // Security check
  const authHeader = request.headers.get('authorization')
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const threeDays = new Date(today)
    threeDays.setDate(threeDays.getDate() + 3)
    const twoDays = new Date(today)
    twoDays.setDate(twoDays.getDate() + 2)

    // Format date for Supabase
    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    // 1. Create test host
    const { error: hostError } = await supabase
      .from('users')
      .upsert({
        id: TEST_IDS.host,
        phone: '+15551234567',
        email: 'testhost@example.com',
        name: 'Test Host',
        role: 'host',
        trust_score_overall: 85,
        trust_status: 'active',
      })

    if (hostError) throw new Error(`Host creation failed: ${hostError.message}`)

    // 2. Create test guests
    const guestNames = ['Alice Guest', 'Bob Guest', 'Carol Guest', 'Dave Guest', 'Eve Guest']
    for (let i = 0; i < guestNames.length; i++) {
      await supabase.from('users').upsert({
        id: TEST_IDS.guests[i],
        phone: `+1555999000${i + 1}`,
        email: `${guestNames[i].toLowerCase().replace(' ', '')}@example.com`,
        name: guestNames[i],
        role: 'guest',
        trust_score_overall: 70 + (i * 3),
        trust_status: 'active',
      })
    }

    // 3. Create 5 test spaces
    const spaces = [
      {
        id: TEST_IDS.spaces.gapAlert,
        name: 'Gap Alert Test',
        description: 'Low attendance - triggers gap-alerts',
        date: formatDate(tomorrow),
        time: '19:00',
        capacity: 10,
        status: 'open',
        price_cents: 2500,
      },
      {
        id: TEST_IDS.spaces.waitlist,
        name: 'Waitlist Test',
        description: 'Full with waitlist - triggers waitlist-promotion',
        date: formatDate(threeDays),
        time: '18:00',
        capacity: 2,
        status: 'open',
        price_cents: 3000,
      },
      {
        id: TEST_IDS.spaces.payment,
        name: 'Payment Retry Test',
        description: 'Failed capture - triggers payment-retry',
        date: formatDate(twoDays),
        time: '20:00',
        capacity: 8,
        status: 'confirmed',
        price_cents: 3500,
      },
      {
        id: TEST_IDS.spaces.digest,
        name: 'Host Digest Test',
        description: 'Tomorrow space - triggers host-digest',
        date: formatDate(tomorrow),
        time: '17:00',
        capacity: 6,
        status: 'confirmed',
        price_cents: 4000,
      },
      {
        id: TEST_IDS.spaces.feedback,
        name: 'Feedback Test',
        description: 'Yesterday completed - triggers feedback-nudge',
        date: formatDate(yesterday),
        time: '19:00',
        capacity: 5,
        status: 'completed',
        price_cents: 2000,
      },
    ]

    for (const space of spaces) {
      await supabase.from('spaces').upsert({
        ...space,
        host_id: TEST_IDS.host,
        tone: 'chill',
        duration_minutes: 120,
        location_address: '123 Test St, San Francisco, CA',
        location_hint: 'Near the park',
      })
    }

    // 4. Create invitations for each scenario
    // Using deterministic UUIDs based on space + guest index

    // Gap Alert: Only 2 accepted out of 10 (20%)
    await supabase.from('invitations').upsert([
      { id: '00000000-0000-0000-0001-000000000001', space_id: TEST_IDS.spaces.gapAlert, user_id: TEST_IDS.guests[0], status: 'accepted', amount_cents: 2500 },
      { id: '00000000-0000-0000-0001-000000000002', space_id: TEST_IDS.spaces.gapAlert, user_id: TEST_IDS.guests[1], status: 'accepted', amount_cents: 2500 },
    ])

    // Waitlist: 2 accepted + 2 waitlisted (capacity = 2, so waitlist ready)
    await supabase.from('invitations').upsert([
      { id: '00000000-0000-0000-0002-000000000001', space_id: TEST_IDS.spaces.waitlist, user_id: TEST_IDS.guests[0], status: 'accepted', amount_cents: 3000 },
      { id: '00000000-0000-0000-0002-000000000002', space_id: TEST_IDS.spaces.waitlist, user_id: TEST_IDS.guests[1], status: 'accepted', amount_cents: 3000 },
      { id: '00000000-0000-0000-0002-000000000003', space_id: TEST_IDS.spaces.waitlist, user_id: TEST_IDS.guests[2], status: 'waitlisted', amount_cents: 3000, waitlist_position: 1 },
      { id: '00000000-0000-0000-0002-000000000004', space_id: TEST_IDS.spaces.waitlist, user_id: TEST_IDS.guests[3], status: 'waitlisted', amount_cents: 3000, waitlist_position: 2 },
    ])

    // Payment Retry: Failed capture with payment intent
    await supabase.from('invitations').upsert([
      {
        id: '00000000-0000-0000-0003-000000000001',
        space_id: TEST_IDS.spaces.payment,
        user_id: TEST_IDS.guests[4],
        status: 'accepted',
        amount_cents: 3500,
        stripe_payment_intent_id: 'pi_test_failed_capture_001',
        captured: false,
        capture_attempts: 1,
      },
    ])

    // Host Digest: 3 accepted guests for tomorrow's space
    await supabase.from('invitations').upsert([
      { id: '00000000-0000-0000-0004-000000000001', space_id: TEST_IDS.spaces.digest, user_id: TEST_IDS.guests[0], status: 'accepted', amount_cents: 4000, captured: true },
      { id: '00000000-0000-0000-0004-000000000002', space_id: TEST_IDS.spaces.digest, user_id: TEST_IDS.guests[1], status: 'accepted', amount_cents: 4000, captured: true },
      { id: '00000000-0000-0000-0004-000000000003', space_id: TEST_IDS.spaces.digest, user_id: TEST_IDS.guests[2], status: 'accepted', amount_cents: 4000, captured: true },
    ])

    // Feedback Nudge: Attended guests from yesterday, not yet asked for feedback
    await supabase.from('invitations').upsert([
      { id: '00000000-0000-0000-0005-000000000001', space_id: TEST_IDS.spaces.feedback, user_id: TEST_IDS.guests[0], status: 'accepted', amount_cents: 2000, captured: true, attended: true, feedback_requested: false },
      { id: '00000000-0000-0000-0005-000000000002', space_id: TEST_IDS.spaces.feedback, user_id: TEST_IDS.guests[1], status: 'accepted', amount_cents: 2000, captured: true, attended: true, feedback_requested: false },
      { id: '00000000-0000-0000-0005-000000000003', space_id: TEST_IDS.spaces.feedback, user_id: TEST_IDS.guests[2], status: 'accepted', amount_cents: 2000, captured: true, attended: true, feedback_requested: false },
    ])

    // Count created data
    const { count: spaceCount } = await supabase
      .from('spaces')
      .select('*', { count: 'exact', head: true })
      .like('id', 'test-space-%')

    const { count: invCount } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .like('id', 'inv-%')

    return NextResponse.json({
      message: 'Test data seeded successfully',
      data: {
        host: 'test-host-001',
        spaces: spaceCount,
        invitations: invCount,
        scenarios: [
          { space: 'test-space-gap-alert', cron: 'gap-alerts', trigger: '20% capacity tomorrow' },
          { space: 'test-space-waitlist', cron: 'waitlist-promotion', trigger: '2 waitlisted with spots available' },
          { space: 'test-space-payment', cron: 'payment-retry', trigger: '1 failed capture' },
          { space: 'test-space-digest', cron: 'host-digest', trigger: 'tomorrow space for host' },
          { space: 'test-space-feedback', cron: 'feedback-nudge', trigger: '3 attended yesterday' },
        ],
      },
    })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE /api/dev/seed - Remove test data
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Delete invitations first (foreign key constraint)
    const invIds = [
      '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0001-000000000002',
      '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002',
      '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0002-000000000004',
      '00000000-0000-0000-0003-000000000001',
      '00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0004-000000000003',
      '00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0005-000000000003',
    ]
    await supabase.from('invitations').delete().in('id', invIds)

    // Delete spaces
    await supabase.from('spaces').delete().in('id', Object.values(TEST_IDS.spaces))

    // Delete users
    await supabase.from('users').delete().in('id', [TEST_IDS.host, ...TEST_IDS.guests])

    return NextResponse.json({ message: 'Test data deleted' })
  } catch (err) {
    console.error('Delete error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
