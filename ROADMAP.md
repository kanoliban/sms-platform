# SMS Platform - Launch Roadmap

> **Last Updated:** 2026-01-03
> **Status:** Launch-ready
> **Next Session:** Optional - TypeScript strict mode, unit tests

---

## Quick Reference

```
To continue work, tell Claude:
"Read ROADMAP.md and continue with the next unchecked item"
```

---

## Current State Summary

### What's Production-Ready
- [x] Auth system (phone OTP + Google OAuth)
- [x] Database schema (8 tables, migrations in `supabase/migrations/`)
- [x] Stripe integration (checkout, webhooks)
- [x] Twilio integration (inbound/outbound SMS)
- [x] Guest RSVP flow (discover → room → checkout → confirmation)
- [x] Location reveal (24h before, cron configured)
- [x] Check-in page
- [x] Feedback collection
- [x] Host room creation & management
- [x] SMS contract invites
- [x] UI design system complete

---

## Phase 1: Critical Security & Money (BLOCKING)

> These must be fixed before any real users or money flows through the system.

### 1.1 Fix JWT Secret Vulnerability
- [x] **Status:** COMPLETED (2026-01-03)
- **Priority:** CRITICAL
- **File:** `src/app/api/auth/verify-code/route.ts`
- **Issue:** Line 7-8 has weak default: `'sms-platform-secret-key-change-in-production'`
- **Fix:** Remove fallback, throw error if JWT_SECRET env var missing
- **Also check:** `src/app/api/auth/me/route.ts`, `src/app/api/rsvp/route.ts`

### 1.2 Add Host Auth Guards
- [x] **Status:** COMPLETED (2026-01-03)
- **Priority:** CRITICAL
- **Issue:** Anyone can access `/host/*` pages without being a host
- **Files to protect:**
  - `src/app/host/page.tsx`
  - `src/app/host/rooms/new/page.tsx`
  - `src/app/host/rooms/[id]/page.tsx`
  - `src/app/host/rooms/[id]/guests/page.tsx`
  - `src/app/host/rooms/[id]/approvals/page.tsx`
  - `src/app/host/rooms/[id]/blasts/page.tsx`
  - `src/app/host/rooms/[id]/settings/page.tsx`
  - `src/app/host/rooms/[id]/insights/page.tsx`
- **Solution:** Create middleware or wrapper component that checks `user.role === 'host'`

### 1.3 Payment Capture After Room
- [x] **Status:** COMPLETED (2026-01-03)
- **Priority:** CRITICAL (money)
- **Issue:** Cards are authorized via Stripe but never captured after room completion
- **Current flow:** Guest pays → PaymentIntent created (authorize only) → Room happens → ??? (never captured)
- **Files:**
  - Create: `src/app/api/cron/capture-payments/route.ts`
  - Update: `vercel.json` to add cron schedule
- **Logic:**
  1. Find rooms where `status = 'completed'` and `date < today`
  2. Find invitations where `attended = true` and `captured = false`
  3. Capture each PaymentIntent via Stripe API
  4. Mark `captured = true` in database
  5. Handle no-shows (release authorization or still charge based on policy)

### 1.4 Pocket Liban Cron Job
- [x] **Status:** COMPLETED (2026-01-03)
- **Priority:** HIGH
- **Issue:** Host prompts are scheduled in `host_prompts` table but never sent
- **Files:**
  - Create: `src/app/api/cron/pocket-liban/route.ts`
  - Update: `vercel.json` to add cron (every 5-10 min)
- **Logic:**
  1. Find prompts where `sent = false` and `send_at <= now`
  2. Get host phone from room
  3. Send SMS via Twilio
  4. Mark `sent = true`, set `sent_at`
- **Reference:** Message templates in `src/lib/twilio/messages.ts` lines 176-277

### 1.5 Room Status Auto-Update
- [x] **Status:** COMPLETED (2026-01-03)
- **Priority:** HIGH
- **Issue:** Room status never transitions automatically
- **Add to post-room cron (`src/app/api/cron/post-room/route.ts`):**
  - Set `status = 'completed'` when room date has passed
  - Set `status = 'in_progress'` during room time window

---

## Phase 2: Core Host Features

### 2.1 Blasts API
- [x] **Status:** COMPLETED (2026-01-03)
- **File to create:** `src/app/api/blasts/route.ts`
- **UI exists at:** `src/app/host/rooms/[id]/blasts/page.tsx`
- **TODO in code:** Line 1 of blasts page has `// TODO: Load blast history from database when table exists`
- **Requirements:**
  1. Create `blasts` table in database (room_id, message, recipient_filter, sent_at, sent_by)
  2. POST endpoint to send blast (iterate guests, send SMS, log to table)
  3. GET endpoint to fetch blast history

### 2.2 Host Onboarding Page
- [x] **Status:** COMPLETED (2026-01-03)
- **File to create:** `src/app/host/onboarding/page.tsx`
- **Referenced at:** `src/app/host/page.tsx` line 319 (`/host/onboarding`)
- **Requirements:**
  1. Philosophy doc reading (what SMS means)
  2. Agreements/commitments
  3. Quiz or acknowledgment
  4. Set `user.role = 'host'` upon completion
  5. Optional: Stripe Connect for host payouts

### 2.3 Insights Page (Real Data)
- [x] **Status:** COMPLETED (2026-01-03)
- **File:** `src/app/host/spaces/[id]/insights/page.tsx`
- **API:** `src/app/api/insights/route.ts`
- **Metrics implemented:**
  - Attendance rate (attended / accepted)
  - Revenue (sum of captured payments vs projected)
  - Response rate (accepted / invited)
  - Feedback scores aggregate (from guest feedback)
  - Average time to RSVP (from responded_at - created_at)

---

## Phase 3: Notifications System

### 3.1 Notifications Database Table
- [x] **Status:** COMPLETED
- **Migration exists and API uses notifications table**

### 3.2 Notification Generation
- [x] **Status:** COMPLETED (2026-01-03)
- **Trigger points implemented:**
  - Location reveal cron → creates notification
  - 1-hour reminder → creates notification
  - (Additional triggers can be added as needed)

### 3.3 Replace Demo Notifications
- [x] **Status:** COMPLETED (2026-01-03)
- **Files updated to use useNotifications hook:**
  - `src/app/discover/page.tsx`
  - `src/app/my-spaces/page.tsx`
  - `src/app/profile/page.tsx`
  - `src/components/composed/app-header.tsx`

### 3.4 Notifications API
- [x] **Status:** COMPLETED
- **File:** `src/app/api/notifications/route.ts`
- **Endpoints:**
  - GET - fetch user's notifications
  - POST - create notification
  - PATCH - mark as read (single or all)

---

## Phase 4: Polish & Edge Cases

### 4.1 Waitlist System
- [x] **Status:** COMPLETED (2026-01-03)
- **Migration:** `006_waitlist_and_preferences.sql`
- **API:** `src/app/api/waitlist/route.ts` (GET/POST/DELETE)
- **Auto-promotion:** Logic in `src/app/api/invitations/[id]/route.ts`
- **Cron:** `src/app/api/cron/waitlist-promotion/route.ts`
- **Features:**
  - Join waitlist when room is full
  - Auto-promote next in line when spot opens
  - SMS + notification on promotion

### 4.2 Settings Persistence
- [x] **Status:** COMPLETED (2026-01-03)
- **Migration:** `006_waitlist_and_preferences.sql` (adds `preferences` JSONB column to users)
- **File:** `src/app/settings/page.tsx`
- **Fix:** Added `preferences` JSONB column on users table

### 4.3 Email Notifications
- [x] **Status:** COMPLETED (2026-01-03)
- **File exists:** `src/lib/email.ts` (22KB, already implemented)
- **Integrated into:**
  - `src/app/api/stripe/webhook/route.ts` - RSVP confirmation email
  - `src/app/api/cron/location-reveal/route.ts` - Location reveal email
  - `src/app/api/cron/post-space/route.ts` - Feedback request email
  - `src/app/api/cron/waitlist-promotion/route.ts` - Waitlist notification email
- **Note:** Emails are sent as backup alongside SMS notifications

### 4.4 Rate Limiting
- [x] **Status:** COMPLETED (2026-01-03)
- **Migration:** `007_rate_limits.sql` (rate_limits table)
- **Utility:** `src/lib/rate-limit.ts` (Supabase-backed rate limiting)
- **Protected endpoints:**
  - `src/app/api/auth/send-code/route.ts` - 5 OTP requests per 10 min per phone
  - `src/app/api/invitations/route.ts` - 50 invites per hour per host
- **Note:** Uses Supabase as backing store for serverless compatibility

---

## Technical Debt

### Remove Demo Fallbacks (Post-Launch)
After Supabase is configured in production, remove demo mode code from:
- [x] `src/app/discover/page.tsx` - isSupabaseConfigured checks (COMPLETED 2026-01-03)
- [x] `src/app/host/page.tsx` - MOCK_ROOMS, MOCK_HOST (COMPLETED 2026-01-03)
- [x] `src/app/profile/page.tsx` - MOCK_USER (COMPLETED 2026-01-03)
- [x] `src/app/my-spaces/page.tsx` - demo data (COMPLETED 2026-01-03)
- [x] `src/app/settings/page.tsx` - localStorage fallback → now uses database (COMPLETED 2026-01-03)

### Code Quality
- [x] Add error boundaries to all pages (COMPLETED 2026-01-03) - Created `src/app/error.tsx` + `ErrorBoundary` component
- [x] Add loading skeletons (COMPLETED 2026-01-03) - Created `Skeleton`, `SkeletonSpaceCard`, `PageSkeleton` components
- [x] Add proper TypeScript strict mode (COMPLETED 2026-01-03) - Enabled noUncheckedIndexedAccess, noImplicitReturns, noFallthroughCasesInSwitch
- [ ] Add unit tests for critical paths (auth, payments)

---

## Environment Variables Checklist

```bash
# Required for production - verify all are set:
[ ] NEXT_PUBLIC_SUPABASE_URL
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] SUPABASE_SERVICE_ROLE_KEY
[ ] TWILIO_ACCOUNT_SID
[ ] TWILIO_AUTH_TOKEN
[ ] TWILIO_PHONE_NUMBER
[ ] STRIPE_SECRET_KEY
[ ] STRIPE_WEBHOOK_SECRET
[ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
[ ] JWT_SECRET              # openssl rand -hex 32
[ ] CRON_SECRET             # openssl rand -hex 32
[ ] NEXT_PUBLIC_APP_URL     # Your production domain
[ ] NOTION_API_KEY          # Optional, for signup form
```

---

## File Reference Index

### API Routes
| Route | File | Status |
|-------|------|--------|
| Auth - Send Code | `src/app/api/auth/send-code/route.ts` | Ready |
| Auth - Verify | `src/app/api/auth/verify-code/route.ts` | Ready |
| Auth - Me | `src/app/api/auth/me/route.ts` | Ready |
| Auth - Logout | `src/app/api/auth/logout/route.ts` | Ready |
| Rooms | `src/app/api/rooms/route.ts` | Ready |
| Invitations | `src/app/api/invitations/route.ts` | Ready |
| RSVP | `src/app/api/rsvp/route.ts` | Ready |
| Stripe Webhook | `src/app/api/stripe/webhook/route.ts` | Ready |
| Twilio Webhook | `src/app/api/twilio/webhook/route.ts` | Ready |
| Cron - Location | `src/app/api/cron/location-reveal/route.ts` | Ready |
| Cron - Post Room | `src/app/api/cron/post-room/route.ts` | Ready |
| Cron - Pocket Liban | `src/app/api/cron/pocket-liban/route.ts` | Ready |
| Cron - Capture | `src/app/api/cron/capture-payments/route.ts` | Ready |
| Blasts | `src/app/api/blasts/route.ts` | Ready |
| Notifications | `src/app/api/notifications/route.ts` | Ready |

### Key Lib Files
| Purpose | File |
|---------|------|
| Auth Context | `src/lib/auth/auth-context.tsx` |
| Supabase Client | `src/lib/supabase/client.ts` |
| Supabase Server | `src/lib/supabase/server.ts` |
| Database Types | `src/lib/supabase/types.ts` |
| Stripe Client | `src/lib/stripe/client.ts` |
| Twilio Client | `src/lib/twilio/client.ts` |
| SMS Templates | `src/lib/twilio/messages.ts` |
| Email (unused) | `src/lib/email.ts` |

### Database
| Location | Contents |
|----------|----------|
| `supabase/migrations/001_initial_schema.sql` | Core tables |
| `supabase/migrations/002_oauth_support.sql` | OAuth additions |
| `supabase/migrations/003_verification_codes.sql` | Phone verification |

---

## Notes for Future Sessions

1. **To check current progress:** Read this file and look for unchecked `[ ]` items
2. **After completing a task:** Update this file to check it off `[x]`
3. **Database changes:** Always create new migration file in `supabase/migrations/`
4. **Cron jobs:** Update `vercel.json` after creating new cron endpoints
5. **The codebase uses:** Next.js 14+ App Router, Tailwind, Supabase, Stripe, Twilio

---

## Completion Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | COMPLETE | Critical security & money |
| Phase 2 | COMPLETE | Core host features |
| Phase 3 | COMPLETE | Notifications system |
| Phase 4 | COMPLETE | Polish & edge cases |
| Tech Debt | COMPLETE | Demo fallbacks removed, error boundaries added |

**Platform is launch-ready.** Optional remaining items: TypeScript strict mode, unit tests.
