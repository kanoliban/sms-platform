-- SMS Platform Test Data Seed
-- Creates 5 test spaces with different scenarios for cron testing

-- ============================================
-- 1. CREATE TEST HOST USER
-- ============================================
INSERT INTO users (id, phone, email, name, role, trust_score_overall, trust_status)
VALUES (
  'test-host-001',
  '+15551234567',
  'testhost@example.com',
  'Test Host',
  'host',
  85,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE TEST GUEST USERS
-- ============================================
INSERT INTO users (id, phone, email, name, role, trust_score_overall, trust_status)
VALUES
  ('test-guest-001', '+15559990001', 'guest1@example.com', 'Alice Guest', 'guest', 70, 'active'),
  ('test-guest-002', '+15559990002', 'guest2@example.com', 'Bob Guest', 'guest', 75, 'active'),
  ('test-guest-003', '+15559990003', 'guest3@example.com', 'Carol Guest', 'guest', 80, 'active'),
  ('test-guest-004', '+15559990004', 'guest4@example.com', 'Dave Guest', 'guest', 65, 'active'),
  ('test-guest-005', '+15559990005', 'guest5@example.com', 'Eve Guest', 'guest', 72, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SPACE 1: GAP ALERT (tomorrow, low capacity)
-- Triggers: gap-alerts cron (< 50% filled, 48h before)
-- ============================================
INSERT INTO spaces (id, host_id, name, description, tone, date, time, duration_minutes, location_address, location_hint, capacity, price_cents, status)
VALUES (
  'test-space-gap-alert',
  'test-host-001',
  'Gap Alert Test Space',
  'This space has low attendance to trigger gap alerts',
  'chill',
  (CURRENT_DATE + INTERVAL '1 day')::date,
  '19:00',
  120,
  '123 Test St, San Francisco, CA',
  'Near the park',
  10,
  2500,
  'open'
) ON CONFLICT (id) DO UPDATE SET date = (CURRENT_DATE + INTERVAL '1 day')::date;

-- Only 2 accepted out of 10 (20% - triggers gap alert)
INSERT INTO invitations (id, space_id, user_id, status, amount_cents)
VALUES
  ('inv-gap-001', 'test-space-gap-alert', 'test-guest-001', 'accepted', 2500),
  ('inv-gap-002', 'test-space-gap-alert', 'test-guest-002', 'accepted', 2500)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SPACE 2: WAITLIST (full with waitlisted guests)
-- Triggers: waitlist-promotion when capacity opens
-- ============================================
INSERT INTO spaces (id, host_id, name, description, tone, date, time, duration_minutes, location_address, location_hint, capacity, price_cents, status)
VALUES (
  'test-space-waitlist',
  'test-host-001',
  'Waitlist Test Space',
  'This space is full with people on waitlist',
  'deep',
  (CURRENT_DATE + INTERVAL '3 days')::date,
  '18:00',
  90,
  '456 Test Ave, San Francisco, CA',
  'Downtown area',
  2,
  3000,
  'full'
) ON CONFLICT (id) DO UPDATE SET date = (CURRENT_DATE + INTERVAL '3 days')::date, status = 'open';

-- 2 accepted (at capacity)
INSERT INTO invitations (id, space_id, user_id, status, amount_cents)
VALUES
  ('inv-wait-001', 'test-space-waitlist', 'test-guest-001', 'accepted', 3000),
  ('inv-wait-002', 'test-space-waitlist', 'test-guest-002', 'accepted', 3000)
ON CONFLICT (id) DO UPDATE SET status = 'accepted';

-- 2 on waitlist
INSERT INTO invitations (id, space_id, user_id, status, amount_cents, waitlist_position)
VALUES
  ('inv-wait-003', 'test-space-waitlist', 'test-guest-003', 'waitlisted', 3000, 1),
  ('inv-wait-004', 'test-space-waitlist', 'test-guest-004', 'waitlisted', 3000, 2)
ON CONFLICT (id) DO UPDATE SET status = 'waitlisted', waitlist_position = EXCLUDED.waitlist_position;

-- ============================================
-- SPACE 3: PAYMENT RETRY (failed capture)
-- Triggers: payment-retry cron
-- ============================================
INSERT INTO spaces (id, host_id, name, description, tone, date, time, duration_minutes, location_address, location_hint, capacity, price_cents, status)
VALUES (
  'test-space-payment',
  'test-host-001',
  'Payment Retry Test Space',
  'Space with failed payment captures',
  'playful',
  (CURRENT_DATE + INTERVAL '2 days')::date,
  '20:00',
  120,
  '789 Test Blvd, San Francisco, CA',
  'Near the station',
  8,
  3500,
  'confirmed'
) ON CONFLICT (id) DO UPDATE SET date = (CURRENT_DATE + INTERVAL '2 days')::date;

-- Invitation with failed capture (has payment intent but not captured, low attempts)
INSERT INTO invitations (id, space_id, user_id, status, amount_cents, stripe_payment_intent_id, captured, capture_attempts)
VALUES (
  'inv-pay-001',
  'test-space-payment',
  'test-guest-005',
  'accepted',
  3500,
  'pi_test_failed_capture_001',
  FALSE,
  1
) ON CONFLICT (id) DO UPDATE SET captured = FALSE, capture_attempts = 1, stripe_payment_intent_id = 'pi_test_failed_capture_001';

-- ============================================
-- SPACE 4: HOST DIGEST (tomorrow's space)
-- Triggers: host-digest cron
-- ============================================
INSERT INTO spaces (id, host_id, name, description, tone, date, time, duration_minutes, location_address, location_hint, capacity, price_cents, status)
VALUES (
  'test-space-digest',
  'test-host-001',
  'Host Digest Test Space',
  'Tomorrow space for digest notification',
  'intense',
  (CURRENT_DATE + INTERVAL '1 day')::date,
  '17:00',
  150,
  '321 Digest Dr, San Francisco, CA',
  'Rooftop venue',
  6,
  4000,
  'confirmed'
) ON CONFLICT (id) DO UPDATE SET date = (CURRENT_DATE + INTERVAL '1 day')::date;

-- Some accepted guests
INSERT INTO invitations (id, space_id, user_id, status, amount_cents, captured)
VALUES
  ('inv-dig-001', 'test-space-digest', 'test-guest-001', 'accepted', 4000, TRUE),
  ('inv-dig-002', 'test-space-digest', 'test-guest-002', 'accepted', 4000, TRUE),
  ('inv-dig-003', 'test-space-digest', 'test-guest-003', 'accepted', 4000, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SPACE 5: FEEDBACK NUDGE (yesterday, completed)
-- Triggers: feedback-nudge cron
-- ============================================
INSERT INTO spaces (id, host_id, name, description, tone, date, time, duration_minutes, location_address, location_hint, capacity, price_cents, status)
VALUES (
  'test-space-feedback',
  'test-host-001',
  'Feedback Test Space',
  'Completed space from yesterday for feedback',
  'chill',
  (CURRENT_DATE - INTERVAL '1 day')::date,
  '19:00',
  120,
  '555 Feedback Ln, San Francisco, CA',
  'Cozy spot',
  5,
  2000,
  'completed'
) ON CONFLICT (id) DO UPDATE SET date = (CURRENT_DATE - INTERVAL '1 day')::date, status = 'completed';

-- Guests who attended (feedback_requested = FALSE so cron will process)
INSERT INTO invitations (id, space_id, user_id, status, amount_cents, captured, attended, feedback_requested)
VALUES
  ('inv-fb-001', 'test-space-feedback', 'test-guest-001', 'accepted', 2000, TRUE, TRUE, FALSE),
  ('inv-fb-002', 'test-space-feedback', 'test-guest-002', 'accepted', 2000, TRUE, TRUE, FALSE),
  ('inv-fb-003', 'test-space-feedback', 'test-guest-003', 'accepted', 2000, TRUE, TRUE, FALSE)
ON CONFLICT (id) DO UPDATE SET attended = TRUE, feedback_requested = FALSE;

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Spaces created:' as info, count(*) as count FROM spaces WHERE id LIKE 'test-space-%';
SELECT 'Invitations created:' as info, count(*) as count FROM invitations WHERE id LIKE 'inv-%';
SELECT 'Test users created:' as info, count(*) as count FROM users WHERE id LIKE 'test-%';
