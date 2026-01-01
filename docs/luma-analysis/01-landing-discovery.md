# Landing & Discovery Analysis

> **Category:** 01-landing-discovery (25 images)
> **Screens:** Landing pages, Auth flows, Marketing, Help Center

---

## 1. Authentication Flow

### Sign In / Sign Up (Images 1-2)
**Screen:** Welcome to Luma - Email entry

| Element | Specification |
|---------|---------------|
| **Layout** | Centered modal on gradient background |
| **Modal** | White card, ~400px width, rounded corners (12px) |
| **Header Icon** | Outlined phone icon in rounded square |
| **Title** | "Welcome to Luma" - Bold, 24px |
| **Subtitle** | "Please sign in or sign up below" - Gray, 14px |
| **Input** | Single email field with label + placeholder |
| **Toggle** | "Use Phone Number" link (right-aligned) |
| **Primary CTA** | "Continue with Email" - Black button, full width |
| **Secondary CTA** | "Sign in with Google" - Ghost button with icon |

**UX Pattern:** Unified sign-in/sign-up (no separate flows)

### OTP Verification (Images 3-4)
**Screen:** Enter Code - 6-digit verification

| Element | Specification |
|---------|---------------|
| **Back Button** | Chevron left (top-left of modal) |
| **Title** | "Enter Code" - Bold, 24px |
| **Subtitle** | "Please enter the 6 digit code we sent to {email}" |
| **Input** | 6 separate square inputs (48x48px each) |
| **Helper Actions** | "Paste Code" button + "Resend code in {X}s" timer |

**UX Pattern:** Individual digit inputs with auto-advance

### Phone Number Linking (Image 5)
**Screen:** Link Phone Number (Optional)

| Element | Specification |
|---------|---------------|
| **Title** | "Link Phone Number" |
| **Value Prop** | "receive reminders via SMS and find your friends" |
| **Input** | Phone number with country code placeholder |
| **Primary CTA** | "Continue" - Black button |
| **Skip Option** | "Skip" - Text link below CTA |

**UX Pattern:** Optional step with clear skip affordance

### Profile Completion (Images 6-9)
**Screen:** Complete Your Profile

| Element | Specification |
|---------|---------------|
| **Title** | "Complete Your Profile" |
| **Subtitle** | "Enter your name and choose an avatar..." |
| **Avatar** | 64px circle with upload overlay icon |
| **Avatar States** | Default emoji, hover (camera icon), uploaded photo |
| **Name Input** | Text field with "Your Name" placeholder |
| **Error State** | Red border + red label text |
| **CTA** | "Let's Go" - Black button, full width |

**UX Patterns:**
- Avatar upload via overlay button on hover
- Inline validation with red border/label
- No skip option (required step)

---

## 2. Global Navigation

### Top Navigation Bar
| Element | Specification |
|---------|---------------|
| **Logo** | "luma" wordmark (left) |
| **Primary Nav** | Events | Calendars | Discover |
| **Right Actions** | Time/timezone, "Create Event" button, Search, Notifications, Avatar |

### Unauthenticated State
| Element | Specification |
|---------|---------------|
| **Right Actions** | "Explore Events" link, "Sign In" button |

---

## 3. Marketing Pages

### Feature Showcase (Images 280-281)
**Theme:** Dark mode with vibrant accent colors

| Pattern | Description |
|---------|-------------|
| **Background** | Solid black (#000) |
| **Accent Colors** | Orange (ticket cards), Yellow (coupons), Pink (gradients) |
| **Cards** | Dark gray cards with rounded corners |
| **Feature Grid** | 3-column layout with icon + title + description |
| **CTA** | Orange "Create New Event" button |
| **Footer** | Previous/Next pagination for releases |

### Release Notes Page (Images 282-283)
**Screen:** Fall 2023 Release - iOS App

| Element | Specification |
|---------|---------------|
| **Hero** | Full-bleed gradient (pink/purple/blue) |
| **Badge** | "luma Fall 2023 Release" |
| **Headline** | Large white text on gradient |
| **Content** | 3-phone mockup display |
| **Feature Cards** | Dark cards with UI previews |
| **CTA** | Blue "Download for iOS" button |

### Pricing Page (Images 284-286)
**Layout:** Two-tier comparison

| Element | Luma (Free) | Luma Plus ($59/yr) |
|---------|-------------|---------------------|
| **Card Style** | White card | Pink accent header |
| **Price** | "Free, forever" | "$59" + "Save 14%" badge |
| **CTA** | "Get Started" (black) | "Get Luma Plus" (pink) |
| **Features** | Checkmark list | Checkmark list |

**Pricing Patterns:**
- Monthly/Annual toggle (pill selector)
- Add-ons table (tiered send volumes)
- Enterprise CTA at bottom

---

## 4. Help Center (Images 287-288)

### Help Center Home
| Element | Specification |
|---------|---------------|
| **Header** | "luma Help Center" + "Back to lu.ma" link |
| **Hero** | Soft gradient background |
| **Icon** | Sparkle/star icon (centered) |
| **Title** | "Welcome. How can we help?" |
| **Search** | Full-width search input |
| **Categories** | "Events", "Luma Plus" section headers |
| **Article Cards** | 2-column grid, white cards with title + preview |

### Help Article Card
```
┌────────────────────────────────┐
│ Event Registration Process     │
│ What happens when a guest      │
│ registers for your event?      │
│ Let's walk through the flow.   │
└────────────────────────────────┘
```

### Help Footer
- "Didn't find what you are looking for?"
- "Contact Us" button with chat icon

---

## 5. Design Tokens Extracted

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-gradient` | `linear-gradient(135deg, #f8f6f4, #f0e8e4, #e8e0dc)` | Auth backgrounds |
| `--surface-white` | `#ffffff` | Cards, modals |
| `--text-primary` | `#1a1a1a` | Headings |
| `--text-secondary` | `#6b7280` | Subtitles, placeholders |
| `--accent-pink` | `#ec4899` | Luma Plus, CTAs |
| `--accent-orange` | `#f97316` | Feature highlights |
| `--error` | `#ef4444` | Validation errors |
| `--dark-bg` | `#000000` | Marketing pages |

### Typography
| Token | Value | Usage |
|-------|-------|-------|
| `--font-heading` | Inter, 600-700, 24-48px | Titles |
| `--font-body` | Inter, 400, 14-16px | Body text |
| `--font-caption` | Inter, 400, 12px | Labels, hints |

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `--modal-padding` | 24px | Modal internal padding |
| `--card-gap` | 16px | Between cards in grid |
| `--input-height` | 44px | Form inputs |
| `--button-height` | 44px | Primary buttons |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Inputs, small elements |
| `--radius-md` | 12px | Cards, modals |
| `--radius-lg` | 16px | Large cards |
| `--radius-full` | 9999px | Avatars, pills |

---

## 6. UX Patterns Summary

### Authentication
- **Passwordless auth** via email OTP
- **Unified flow** (no sign-in vs sign-up distinction)
- **Progressive disclosure** (optional phone, required profile)
- **Social login** as secondary option

### Navigation
- **Minimal top nav** with clear hierarchy
- **Context-aware actions** (auth state changes right side)

### Marketing
- **Dark mode for impact** on feature/release pages
- **Gradient heroes** for visual interest
- **Comparison tables** for pricing clarity

### Help
- **Search-first** approach
- **Card-based** article browsing
- **Clear escalation** path to support
