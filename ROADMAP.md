# SMS Platform - Launch Roadmap

> **Last Updated:** 2026-01-04
> **Status:** Launch-ready → Now building Growth Engine
> **Next Phase:** Phase 6 - Referral System (Growth Engine)

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

## Phase 5: SEO & Marketing

### 5.1 Technical SEO Foundation
- [x] **Status:** COMPLETED (2026-01-03)
- **Implemented:**
  - Favicon and metadata (`src/app/layout.tsx`)
  - robots.txt (`public/robots.txt`)
  - Dynamic sitemap.xml (`src/app/sitemap.xml/route.ts`)
  - Structured data - Organization schema (`src/components/seo/structured-data.tsx`)
  - Structured data - Event schema for spaces
  - llms.txt for AI crawlers (`public/llms.txt`)
  - Google Search Console verification
  - BreadcrumbList schema for discover, help, spaces pages

### 5.2 Performance & Core Web Vitals
- [x] **Status:** COMPLETED (2026-01-03)
- **Implemented:**
  - Preconnect/dns-prefetch for Supabase (`src/app/layout.tsx`)
  - Async script loading for analytics
  - Font optimization (Inter with next/font)

### 5.3 Analytics & Tracking
- [x] **Status:** COMPLETED (2026-01-03)
- **Implemented:**
  - Google Analytics 4 (Measurement ID: G-4Q8R9PDFKZ)
  - Vercel Analytics (`@vercel/analytics`)
  - GA4 ↔ Search Console linked

### 5.4 Local SEO
- [x] **Status:** COMPLETED (2026-01-03)
- **Implemented:**
  - Google Business Profile (Minneapolis)
  - FAQ schema on help page (`src/app/help/layout.tsx`)

### 5.5 Future SEO Improvements (Optional)
- [ ] Image optimization (WebP format, lazy loading, next/image optimization)
- [ ] Page-specific OG images (design + implementation)
- [ ] Local directory listings (Yelp, Eventbrite, Meetup)
- [ ] Blog/content strategy for long-tail keywords
- [ ] Backlink building and outreach

### 5.6 SEO Monitoring (Ongoing)
- [ ] Check GSC for crawl errors (weekly for first month)
- [ ] Monitor Core Web Vitals in GSC
- [ ] Track keyword rankings for "strangers meeting strangers" + Minneapolis events
- [ ] Review GA4 traffic patterns and bounce rates
- [ ] Request reviews on Google Business Profile

---

## Phase 6: Growth Engine (Referrals & Virality)

> **Goal:** Turn every satisfied guest into a growth channel. This is the compound growth lever.

### 6.1 Referral System - Database & API
- [ ] **Status:** NOT STARTED
- [ ] **Priority:** HIGH (Growth)
- **Migration to create:** `supabase/migrations/010_referrals.sql`
- **Tables:**
  ```sql
  -- Referral codes and tracking
  referrals (
    id uuid PRIMARY KEY,
    referrer_id uuid REFERENCES users(id),
    code varchar(8) UNIQUE,           -- e.g., "ALEX2024"
    uses_count int DEFAULT 0,
    max_uses int DEFAULT NULL,        -- NULL = unlimited
    reward_cents int DEFAULT 500,     -- $5 credit per referral
    created_at timestamptz
  )

  -- Track each referral conversion
  referral_conversions (
    id uuid PRIMARY KEY,
    referral_id uuid REFERENCES referrals(id),
    referee_id uuid REFERENCES users(id),
    converted_at timestamptz,
    first_rsvp_space_id uuid,         -- Which space they first joined
    reward_claimed boolean DEFAULT false
  )

  -- User credits/wallet
  user_credits (
    user_id uuid PRIMARY KEY REFERENCES users(id),
    balance_cents int DEFAULT 0,
    lifetime_earned_cents int DEFAULT 0,
    updated_at timestamptz
  )

  -- Credit transactions log
  credit_transactions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    amount_cents int,                 -- positive = credit, negative = debit
    type varchar(50),                 -- 'referral_bonus', 'referral_reward', 'checkout_applied'
    reference_id uuid,                -- referral_id or invitation_id
    created_at timestamptz
  )
  ```
- **API to create:** `src/app/api/referrals/route.ts`
  - `GET` - Get user's referral code + stats
  - `POST` - Generate referral code (if doesn't exist)
  - `GET /api/referrals/[code]` - Validate code, get referrer info

### 6.2 Referral Code Generation & Sharing
- [ ] **Status:** NOT STARTED
- **Files to create/update:**
  - `src/app/api/referrals/route.ts` - API endpoints
  - `src/app/api/referrals/[code]/route.ts` - Code lookup
  - `src/components/composed/referral-share-card.tsx` - Shareable card UI
- **Logic:**
  1. Generate unique 8-char code on first request (or user-customizable)
  2. Referral link format: `sms.events/r/ALEXCODE`
  3. Track clicks, signups, and first RSVPs
  4. Show referrer their stats: shares, signups, earnings

### 6.3 Referral Conversion Tracking
- [ ] **Status:** NOT STARTED
- **Integration points:**
  - `src/app/api/auth/verify-code/route.ts` - Check for referral cookie on signup
  - `src/app/api/stripe/webhook/route.ts` - Award credits on first RSVP
  - `src/middleware.ts` - Store referral code in cookie from `/r/[code]` route
- **Flow:**
  1. Friend clicks `sms.events/r/ALEXCODE`
  2. Cookie stored: `sms_referral=ALEXCODE` (30 days)
  3. Friend signs up → `referral_conversions` row created
  4. Friend completes first RSVP → Both get $5 credit
  5. Referrer notified via SMS + notification

### 6.4 Credits System & Checkout Integration
- [ ] **Status:** NOT STARTED
- **Files to update:**
  - `src/app/api/credits/route.ts` - Get balance, transaction history
  - `src/app/spaces/[id]/page.tsx` - Show "Apply $X credit" option
  - `src/app/api/stripe/checkout/route.ts` - Reduce price by credit amount
  - `src/app/api/stripe/webhook/route.ts` - Deduct credits on successful payment
- **Rules:**
  - Credits can cover up to 100% of room price
  - Credits never expire
  - Show balance in header/profile

### 6.5 "Invite Friends" UI Integration
- [ ] **Status:** NOT STARTED
- **Files to update:**
  - `src/app/spaces/[id]/success/page.tsx` - Prominent "Invite a friend, you both get $5" CTA
  - `src/app/profile/page.tsx` - Referral stats section
  - `src/components/composed/share-space-modal.tsx` - Add referral option
- **Copy:**
  - "Invite a friend → You both get $5 off your next room"
  - "Your referral code: ALEXCODE"
  - "You've earned $X from referrals"

---

## Phase 7: Retention & Community

> **Goal:** Keep guests coming back and build network effects.

### 7.1 Feedback Persistence (Fix Current Gap)
- [ ] **Status:** NOT STARTED
- [ ] **Priority:** HIGH (Data loss)
- **Issue:** `src/app/spaces/[id]/feedback/page.tsx` simulates submission but doesn't save
- **Migration:** `supabase/migrations/011_feedback.sql`
  ```sql
  feedback (
    id uuid PRIMARY KEY,
    space_id uuid REFERENCES spaces(id),
    user_id uuid REFERENCES users(id),
    overall_rating int CHECK (1-5),
    would_recommend int CHECK (1-10),  -- NPS score
    host_rating int CHECK (1-5),
    highlights text,
    suggestions text,
    created_at timestamptz,
    UNIQUE(space_id, user_id)
  )
  ```
- **Files to update:**
  - `src/app/api/feedback/route.ts` - POST to save feedback
  - `src/app/spaces/[id]/feedback/page.tsx` - Call API instead of simulating
  - `src/app/api/insights/route.ts` - Aggregate feedback for host insights

### 7.2 Follow Hosts
- [ ] **Status:** NOT STARTED
- **Migration:** `supabase/migrations/012_follows.sql`
  ```sql
  follows (
    follower_id uuid REFERENCES users(id),
    host_id uuid REFERENCES users(id),
    created_at timestamptz,
    PRIMARY KEY (follower_id, host_id)
  )
  ```
- **Files to create:**
  - `src/app/api/follows/route.ts` - Follow/unfollow endpoints
  - `src/components/host/follow-button.tsx` - UI component
- **Integration:**
  - Add follow button on space detail page (next to host info)
  - Add follow button on host profile (if we create one)
  - Notification when followed host creates new room

### 7.3 "Followed Hosts" in Discover
- [ ] **Status:** NOT STARTED
- **Files to update:**
  - `src/app/discover/page.tsx` - Add "From Hosts You Follow" section
  - `src/app/api/spaces/route.ts` - Add `?following=true` filter
- **UX:**
  - If user follows hosts, show their rooms first
  - "Hosts You Follow" section above general discover

### 7.4 Post-Room Connections (Magic Moment)
- [ ] **Status:** NOT STARTED
- [ ] **Priority:** MEDIUM (Differentiator)
- **Concept:** After room ends, let guests opt-in to share contact with others who also opt-in
- **Migration:** `supabase/migrations/013_connections.sql`
  ```sql
  connection_optins (
    id uuid PRIMARY KEY,
    space_id uuid REFERENCES spaces(id),
    user_id uuid REFERENCES users(id),
    opted_in boolean DEFAULT false,
    share_email boolean DEFAULT true,
    share_phone boolean DEFAULT false,
    created_at timestamptz,
    UNIQUE(space_id, user_id)
  )
  ```
- **Flow:**
  1. After room completes, show "Stay connected?" prompt
  2. Users opt-in with what to share (email/phone)
  3. After 24h, match mutual opt-ins
  4. Send email with list of connections
- **Files:**
  - `src/app/api/connections/route.ts` - Opt-in API
  - `src/app/api/cron/match-connections/route.ts` - Daily matcher
  - `src/app/spaces/[id]/connect/page.tsx` - Opt-in UI

### 7.5 Personalized Recommendations
- [ ] **Status:** NOT STARTED
- [ ] **Priority:** LOW (Requires data)
- **Concept:** "Rooms you might like" based on past attendance
- **Factors:**
  - Same host as rooms you've attended
  - Same tone (chill, deep, playful, intense)
  - Similar price range
  - Same neighborhood
- **Files:**
  - `src/app/api/recommendations/route.ts` - Recommendation engine
  - `src/app/discover/page.tsx` - "Recommended for You" section
- **Note:** Requires sufficient user history; defer until after launch

---

## Phase 8: Trust & Safety (Scale Preparation)

> **Goal:** Build moderation tools before they're urgently needed.

### 8.1 Reporting System
- [ ] **Status:** NOT STARTED
- **Migration:** `supabase/migrations/014_reports.sql`
  ```sql
  reports (
    id uuid PRIMARY KEY,
    reporter_id uuid REFERENCES users(id),
    reported_user_id uuid REFERENCES users(id),
    reported_space_id uuid REFERENCES spaces(id),
    type varchar(50),  -- 'harassment', 'no_show', 'inappropriate', 'spam', 'other'
    description text,
    status varchar(20) DEFAULT 'pending',  -- 'pending', 'reviewed', 'actioned', 'dismissed'
    reviewed_by uuid REFERENCES users(id),
    reviewed_at timestamptz,
    created_at timestamptz
  )
  ```
- **Files:**
  - `src/app/api/reports/route.ts` - Submit report
  - `src/components/composed/report-modal.tsx` - Report UI
  - `src/app/founder/reports/page.tsx` - Admin review queue

### 8.2 Guest Reputation (Mutual Reviews)
- [ ] **Status:** NOT STARTED
- **Concept:** Hosts can privately rate guests after room; affects guest's ability to join future rooms
- **Migration:** `supabase/migrations/015_guest_reviews.sql`
  ```sql
  guest_reviews (
    id uuid PRIMARY KEY,
    host_id uuid REFERENCES users(id),
    guest_id uuid REFERENCES users(id),
    space_id uuid REFERENCES spaces(id),
    rating int CHECK (1-5),
    private_notes text,  -- Only visible to future hosts
    flags text[],  -- ['late', 'disruptive', 'no_show', 'excellent']
    created_at timestamptz,
    UNIQUE(host_id, guest_id, space_id)
  )
  ```
- **Integration:**
  - Host sees guest's average rating when reviewing applications
  - Auto-decline guests below threshold (host configurable)
  - "Excellent" flag = priority for popular rooms

### 8.3 Moderation Dashboard
- [ ] **Status:** NOT STARTED
- **File:** `src/app/founder/moderation/page.tsx`
- **Features:**
  - View all reports with context
  - User lookup (history, rooms, reviews)
  - Actions: warn, suspend, ban
  - Audit log of all moderation actions

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
- [x] Add unit tests for critical paths (auth, payments, RSVP, invitations) (COMPLETED 2026-01-03) - Vitest setup with 64 tests

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
| **Referrals** | `src/app/api/referrals/route.ts` | Phase 6 |
| **Credits** | `src/app/api/credits/route.ts` | Phase 6 |
| **Feedback** | `src/app/api/feedback/route.ts` | Phase 7 |
| **Follows** | `src/app/api/follows/route.ts` | Phase 7 |
| **Connections** | `src/app/api/connections/route.ts` | Phase 7 |
| **Reports** | `src/app/api/reports/route.ts` | Phase 8 |

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
| Phase 1 | ✅ COMPLETE | Critical security & money |
| Phase 2 | ✅ COMPLETE | Core host features |
| Phase 3 | ✅ COMPLETE | Notifications system |
| Phase 4 | ✅ COMPLETE | Polish & edge cases |
| Phase 5 | ✅ COMPLETE | SEO & marketing foundation |
| **Phase 6** | 🔴 NOT STARTED | **Growth Engine (Referrals)** ← START HERE |
| Phase 7 | ⚪ NOT STARTED | Retention & Community |
| Phase 8 | ⚪ NOT STARTED | Trust & Safety |
| Tech Debt | ✅ COMPLETE | Demo fallbacks removed, error boundaries added |

---

## Strategic Priority Order

**Immediate (Growth Engine):**
1. 6.1 Referral database + API
2. 6.2 Referral code generation
3. 6.3 Conversion tracking
4. 6.4 Credits system
5. 6.5 "Invite Friends" UI

**Next (Retention):**
1. 7.1 Feedback persistence (quick win, fixes data loss)
2. 7.2 Follow hosts
3. 7.4 Post-room connections

**Later (Scale Prep):**
1. 8.1 Reporting system
2. 8.2 Guest reputation
3. 8.3 Moderation dashboard

---

## Quick Start for Next Session

```
To build the referral system:
"Read ROADMAP.md Phase 6.1 and implement the referrals database migration"
```
