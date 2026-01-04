# User Onboarding Plan

> **Status:** Planning
> **Priority:** High (UX improvement)
> **Created:** 2026-01-03

## Problem

After registration, users land on `/my-spaces` with no guidance. The hosting option is buried in `/discover` footer. Users may not realize they can host.

## Solution

Add a post-registration onboarding flow that:
1. Welcomes the user
2. Asks their intent (attend, host, or both)
3. Routes them appropriately

## User Flow

```
Registration Complete
        ↓
  /onboarding/welcome
   "Welcome to SMS"
   "What brings you here?"
        ↓
   ┌─────────────────────────────────────┐
   │  [ ] I want to attend spaces        │
   │  [ ] I want to host spaces          │
   │  [ ] Both - attend and host         │
   └─────────────────────────────────────┘
        ↓
   Based on selection:

   "Attend" → Quick intro to discovering spaces → /discover
   "Host"   → /host/onboarding (existing flow)
   "Both"   → Quick intro → option to do host onboarding now or later
```

## Technical Implementation

### New Files
- `src/app/onboarding/page.tsx` - Main onboarding page
- `src/app/onboarding/layout.tsx` - Clean layout (no nav)

### Database Changes
- Add `onboarding_completed` boolean to users table
- Add `user_intent` enum ('attend', 'host', 'both') to users table

### Auth Flow Update
- After successful registration in `src/lib/auth/auth-context.tsx`
- Check if `onboarding_completed === false`
- Redirect to `/onboarding` instead of `/my-spaces`

## Copy/Content

### Welcome Screen
**Headline:** "Welcome to SMS"
**Subhead:** "Strangers Meeting Strangers is about intentional human connection."

### Intent Question
**Question:** "What brings you to SMS?"
**NOT:** "Host or Attend?" (implies mutual exclusivity)

**Options:**
1. **"I want to discover and attend spaces"**
   - Description: "Find gatherings hosted by others in your area"

2. **"I want to create and host spaces"**
   - Description: "Host your own gatherings and build community"

3. **"Both - I want to attend and host"**
   - Description: "Experience spaces as a guest and create your own"

### After Selection
- **Attend:** "Great! Let's find your first space." → /discover
- **Host:** "Awesome! Let's get you set up as a host." → /host/onboarding
- **Both:** "Perfect! You can attend spaces right away. Want to complete host setup now or explore first?"

## Edge Cases

1. **User skips onboarding** - Allow skip, default to "attend" intent
2. **User changes mind later** - Can always access host onboarding via "Become a Host"
3. **Returning user** - Only show onboarding once (check `onboarding_completed`)

## Success Metrics

- % of users who complete onboarding
- % who select "host" or "both"
- Time to first RSVP
- Time to first space creation (for hosts)

## Implementation Steps

1. [ ] Create migration for `onboarding_completed` and `user_intent` columns
2. [ ] Create `/onboarding` page with welcome + intent selection
3. [ ] Update auth context to redirect new users to onboarding
4. [ ] Add "Skip" option that defaults to attend intent
5. [ ] Track completion in database
6. [ ] Test all three paths (attend, host, both)

---

*This plan is ready for implementation in a separate Claude Code session.*
