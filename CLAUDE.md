# SMS Platform - Claude Code Knowledge Base

> **Philosophy:** This file is a living document. After significant sessions, update it with new patterns, decisions, and learnings. Claude Code reads this at session start—compound knowledge here.

---

## 🔄 How to Update This File

After any session that establishes new patterns or makes significant decisions:

```
"Add to CLAUDE.md: [pattern/decision/learning]"
```

**When to update:**
- New UI component patterns established
- API conventions decided
- Brand/copy decisions made
- Bugs fixed that reveal gotchas
- Architecture decisions made
- Helper functions created for reuse

---

## 🎨 Brand: SMS (Strangers Meeting Strangers)

### SMS Brand Name Styling (CRITICAL)
When displaying "SMS" as the brand name in UI, **always** apply:
- **Bold** + **Italic** + **White text**

```tsx
// Inline (simple cases)
<strong className="text-white"><em>SMS</em></strong>

// Helper function (for dynamic text with SMS in it)
function styleSMS(text: string) {
  const parts = text.split(/(SMS)/g)
  return parts.map((part, i) => {
    if (part === 'SMS') {
      return <strong key={i} className="text-white"><em>SMS</em></strong>
    }
    return part
  })
}

// Usage
{styleSMS("Welcome to SMS hosting")}
{styleSMS(terms.summary)}
```

### Brand Confusion Avoidance
- ❌ "You'll receive an SMS" → ✅ "You'll receive a text message"
- ❌ "Send an SMS to..." → ✅ "Send a text to..."
- The word "SMS" should only appear as the brand, never as "text message" technology

### Copy Patterns
- "host community" → just "community"
- Always: "***SMS*** Host Terms" (branded in legal)
- Marketing: "***SMS***" in any headline/title mentioning the brand

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 + CSS Variables |
| Database | Supabase (PostgreSQL) |
| Auth | Phone OTP + Google OAuth (custom JWT) |
| Payments | Stripe (authorize → capture flow) |
| SMS | Twilio |
| Email | Resend |
| Deploy | Vercel |
| Testing | Vitest + React Testing Library |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints (send-code, verify-code, me, logout)
│   │   ├── host/          # Host-specific endpoints (apply, applications)
│   │   ├── cron/          # Vercel cron jobs (capture-payments, pocket-liban)
│   │   └── dev/           # Dev-only endpoints (login, reset)
│   ├── host/              # Host dashboard pages
│   ├── spaces/            # Guest space pages
│   ├── founder/           # Founder admin pages
│   └── (public)/          # Public pages (about, terms, privacy)
├── components/
│   ├── ui/                # Design system primitives (Button, Modal, Card, etc.)
│   ├── composed/          # Composite components (LoginModal, SpaceCard)
│   ├── host/              # Host-specific components
│   └── layout/            # Layout components (Header, Footer)
├── lib/
│   ├── auth/              # Auth context, hooks
│   ├── supabase/          # Supabase client (browser/server/admin)
│   ├── stripe/            # Stripe utilities
│   ├── twilio/            # Twilio SMS functions
│   └── email.ts           # Resend email templates
└── styles/
    ├── design-system.css  # Master import
    └── tokens/            # CSS custom properties
        ├── colors.css     # Color palette
        ├── typography.css # Font scales
        ├── spacing.css    # Spacing/layout
        ├── radius.css     # Border radius
        ├── shadows.css    # Shadows/glows
        └── transitions.css # Animations
```

---

## 🎨 Design System

### CSS Variables (use these, not hardcoded values)

**Backgrounds:**
- `--bg-base` (#000000) - page background
- `--bg-elevated` (#0a0a0a) - lifted surfaces
- `--bg-surface` (#111111) - cards, modals
- `--bg-subtle` (#262626) - inputs, wells

**Text:**
- `--text-primary` (#ffffff) - headings, body
- `--text-secondary` (#a1a1aa) - labels
- `--text-muted` (#71717a) - hints, placeholders

**Primary Accent (Warm Amber):**
- `--primary` (#d97706) - main accent
- `--primary-hover` (#b45309)
- `--primary-muted` (15% opacity) - backgrounds

**Semantic:**
- `--success`, `--error`, `--warning`, `--info`
- Each has `-hover`, `-muted`, `-text` variants

**Borders:**
- `--border-default` (10% white)
- `--border-subtle` (5% white)
- `--border-hover` (20% white)

### Component Import Pattern
```tsx
import { Button, Modal, Card, Badge } from '@/components/ui'
import { toast } from '@/components/ui/toast'
```

### Text Size Variables
```css
--text-xs, --text-sm, --text-base, --text-lg, --text-xl, --text-2xl
```

### Radius Variables
```css
--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full
```

---

## 🔐 Auth Patterns

### JWT Auth (Custom Implementation)
```tsx
// Client-side: use auth context
import { useAuth } from '@/lib/auth/auth-context'
const { user, loading } = useAuth()

// Server-side: verify JWT
import { jwtVerify } from 'jose'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
```

### Cookie Name
```typescript
const COOKIE_NAME = 'sms_auth_token'
```

### Dev Login (Development Only)
```bash
# Login as different roles
POST /api/dev/login { role: "guest" }
POST /api/dev/login { role: "host" }
POST /api/dev/login { role: "founder" }

# Multiple accounts per role
POST /api/dev/login { role: "guest:2" }  # Second guest account
POST /api/dev/login { role: "host:3" }   # Third host account

# Reset user for testing
DELETE /api/dev/login { phone: "+15550000001" }
```

### Role Hierarchy
- `guest` → Default, can RSVP to spaces
- `host` → Can create/manage spaces (requires application approval)
- `founder` → Full admin access

---

## 📝 API Patterns

### Response Format
```typescript
// Success
return NextResponse.json({ data, success: true })

// Error
return NextResponse.json(
  { error: 'Human-readable message' },
  { status: 400 | 401 | 403 | 404 | 500 }
)
```

### Auth Check Pattern
```typescript
const cookieStore = await cookies()
const token = cookieStore.get('sms_auth_token')?.value

if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const { payload } = await jwtVerify(token, JWT_SECRET)
const userId = payload.userId as string
```

### Supabase Client Selection
```typescript
// Browser components
import { createBrowserClient } from '@/lib/supabase/browser'

// Server components/API routes (respects RLS)
import { createServerClient } from '@/lib/supabase/server'

// API routes needing admin access (bypasses RLS)
import { createAdminClient } from '@/lib/supabase/server'
```

---

## 🧪 Testing

### Commands
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

### Test File Location
Tests live alongside source: `*.test.ts` or `*.test.tsx`

### API Route Testing Pattern
```typescript
import { POST } from './route'
import { NextRequest } from 'next/server'

const mockRequest = (body: object) =>
  new NextRequest('http://localhost/api/endpoint', {
    method: 'POST',
    body: JSON.stringify(body),
  })
```

---

## 🚀 Deployment

### Vercel Environment Variables Required
```
# Database
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Auth
JWT_SECRET (CRITICAL - no fallback in production)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Payments
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# SMS
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER

# Email
RESEND_API_KEY
```

### Cron Jobs (vercel.json)
- `/api/cron/capture-payments` - Capture authorized payments post-room
- `/api/cron/pocket-liban` - Send scheduled host prompts
- `/api/cron/location-reveal` - Send location 24h before room

---

## 📚 Session Learnings (Append Here)

### 2026-01-04: SMS Branding Consistency
- **Decision:** SMS brand always styled as `<strong className="text-white"><em>SMS</em></strong>`
- **Pattern:** Created `styleSMS()` helper for dynamic text
- **Gotcha:** "an SMS" causes confusion with brand—use "a text message" instead

### 2026-01-04: Host Application Flow
- **Components:** `HostApplicationFlow` → `HostTermsModal` → `SignatureModal`
- **Pattern:** Multi-step modal flow with state machine (`'agreement' | 'terms' | 'signature'`)
- **E-sign compliance:** Signature name stored with timestamp

### 2026-01-04: Confetti Component
- **Location:** `src/components/ui/confetti.tsx`
- **Props:** `duration` (ms), `count` (pieces)
- **Features:** Varied shapes (square/circle/rectangle), sizes (8-16px), CSS animations

### 2026-01-04: Dev Login TypeScript
- **Pattern:** Use `as const satisfies Record<...>` for stricter typing with literal types
- **Gotcha:** Need explicit null checks even with satisfies pattern

---

## 🔮 Quick Reference for Claude

### When Adding New UI
1. Use CSS variables from design system (never hardcode colors)
2. Import from `@/components/ui`
3. Apply SMS branding to any brand mention
4. Use `toast()` for user feedback

### When Adding New API
1. Use `createAdminClient()` for admin operations
2. Always check JWT auth first
3. Return proper status codes
4. Log errors with `console.error`

### When Modifying Copy
1. Check if "SMS" appears → apply branding
2. Check for "an SMS" → change to "a text message"
3. Use "community" not "host community"

### Before Committing
1. Run `npm run build` to check types
2. Run `npm test` if tests exist for changed code
3. Use descriptive commit messages

---

## 📋 Roadmap Integration

See `ROADMAP.md` for current status. Quick command:
```
"Read ROADMAP.md and continue with the next unchecked item"
```
