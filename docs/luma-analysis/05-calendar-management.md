# Calendar Management Analysis

> **Category:** 06-calendar-management (50 images)
> **Screens:** Calendar creation, public page, settings, verification, embed

---

## 1. Create Calendar Page

### Form Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Events | Calendars | Discover          Create Event  Q  🔔 👤│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Create Calendar                                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                          [Change Cover]   │ │
│  │              (Cover Image Area)                           │ │
│  │                                                           │ │
│  │  ┌─────┐                                                  │ │
│  │  │ 🎨 │← Avatar (with camera overlay)                    │ │
│  │  └─────┘                                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Calendar Name                                                  │
│  Add a short description.                                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Customization                                             │ │
│  │                                                           │ │
│  │ Tint Color                     Location                   │ │
│  │ ● ● ● ● ● ● ● ● ● ●           [City] [Global]            │ │
│  │                                ┌─────────────────────┐    │ │
│  │ Public URL                     │ (Map Preview)       │    │ │
│  │ lu.ma/ [____________]          │  ◎ Pick a city      │    │ │
│  │                                └─────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [✓ Create Calendar]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tint Color Palette (10 colors)
| Color | Hex (approx) |
|-------|--------------|
| Gray | `#9ca3af` |
| Pink | `#ec4899` |
| Fuchsia | `#d946ef` |
| Purple | `#8b5cf6` |
| Blue | `#3b82f6` |
| Green | `#22c55e` |
| Yellow | `#eab308` |
| Orange | `#f97316` |
| Red | `#ef4444` |
| Rainbow | Multi-color gradient |

### Location Picker
| Element | Specification |
|---------|---------------|
| **Toggle** | City / Global pill selector |
| **Map** | Light gray world map preview |
| **Search** | "Pick a city" with location icon |
| **Autocomplete** | City name + region dropdown |

---

## 2. Calendar Public Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   (Cover Image - gradient)                │ │
│  │  ┌─────┐                                                  │ │
│  │  │ SLM │                                      [Manage ↗] │ │
│  │  └─────┘                                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Demo Product Session                                           │
│  ◎ Singapore — 3:19 PM GMT+8                                   │
│  demo product to investor                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Events                    [□] [≡] [Q]     [+ Add Event] [RSS] │
│                                                                 │
│                            ┌──────────────────────────────────┐│
│  Today Tuesday             │      November         < · >      ││
│                            │  S  M  T  W  T  F  S            ││
│  6:00 AM  Tech Meetup      │ 27 28 29 30 31  1  2            ││
│           👥 By Alex Smith │  3  4  5  6  7  8  9            ││
│           & Sam Lee        │ 10 11 12 13 14 15 16    Hosting ││
│                            │ 17 18 19 20 21 22 23            ││
│  Nov 18 Monday             │ 24 25 26 27 28 29 30            ││
│                            │  1  2  3  4  5  6  7            ││
│  9:00 AM  Tech Meetup      │                                  ││
│           👤 By Alex Smith │ [Upcoming]  [Past]               ││
│                            └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Event List Elements
| Element | Specification |
|---------|---------------|
| **Date Header** | "Today Tuesday" / "Nov 18 Monday" |
| **Time** | 12-hour format (6:00 AM) |
| **Event Name** | Bold, primary text |
| **Host Avatars** | Stacked circles with names |
| **Status Badge** | "Hosting" in pink (right-aligned) |
| **View Toggles** | Grid / List icons |
| **Calendar Widget** | Mini month view with Upcoming/Past tabs |

### Event Card (Expanded)
```
┌────────────────────────────────────────────────────────────┐
│ ✦ LIVE  5:00 AM                            [Event Image]  │
│ ✦ Tech Meetup                                   Meetup    │
│   👥 By Alex Smith & Sam Lee                              │
│   📹 Zoom                                                 │
│                                                           │
│   [□ Start Event]  [Manage →]                            │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Calendar Tab Navigation

### Tabs (Calendar Level)
```
Events | People | Newsletters | Insights | Settings
        ──────
```

| Tab | Purpose |
|-----|---------|
| **Events** | List/calendar view of all events |
| **People** | Subscribers and imported contacts |
| **Newsletters** | Email campaigns and drafts |
| **Insights** | Analytics and metrics |
| **Settings** | Calendar configuration |

---

## 4. People Tab

### Empty State
```
┌────────────────────────────────────────────────────────────┐
│  People                                    [+ Add People]  │
│                                                            │
│  🔍 Search                                           ⬇️   │
│  [🔽 Filter ⌄]                     [Recently Joined ⌄]    │
│                                                            │
│                     ⌛                                     │
│                                                            │
│                 No Subscribers                             │
│    When people subscribe to your calendar, they will      │
│    appear here.                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Add People Modal (CSV Import)
```
┌────────────────────────────────────────────────────────────┐
│  <  Add People                                        ✕   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                        📄                                  │
│                       csv                                  │
│                                                            │
│               Import CSV File                              │
│        Drop file or click here to choose file.            │
│                                                            │
│  ⬇️ Download CSV Template                                  │
│                                                            │
│  [████████████ Preview ████████████]                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Verify Calendar (Send Limit Increase)

### Verification Form
```
┌────────────────────────────────────────────────────────────┐
│  Verify Calendar                                           │
│                                                            │
│  In order to increase your invite and newsletter limits,   │
│  please share some information about your planned events   │
│  and contacts.                                             │
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │ 🗓️ For Calendar                                        ││
│  │    Demo Product Session                                ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  How many people would you like to invite or send          │
│  newsletters to?                                           │
│  ┌──────┐                                                  │
│  │  5   │                                                  │
│  └──────┘                                                  │
│                                                            │
│  Please share some information about your events.          │
│  ┌────────────────────────────────────────────────────────┐│
│  │ We host monthly product demo sessions to showcase new  ││
│  │ features and updates to our customers...               ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Please share some information about your guests.          │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Our contact list is built from users who have opted   ││
│  │ in through our website...                             ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  ☑️ I confirm I will not import or contact people with     │
│     inactive email addresses or who have unsubscribed.    │
│                                                            │
│  ☑️ I confirm that I will only message people who have     │
│     opted in and consented to receiving emails.           │
│                                                            │
│  [✓ Submit Request]                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Consent Checkboxes
| Checkbox | Purpose |
|----------|---------|
| **No inactive contacts** | Prevent bounces/spam |
| **Opt-in consent** | GDPR/CAN-SPAM compliance |

---

## 6. Settings Sidebar Navigation

### Settings Menu
```
┌────────────────┐
│ ✨ Display     │
│ $ Payment      │
│ ⚙️ Options     │
│ 👥 Admins      │
│ 🏷️ Tags        │
│ 📦 Embed       │
│ ⏱️ Send Limit  │
│ ♥️ Luma Plus   │
└────────────────┘
```

| Setting | Purpose |
|---------|---------|
| **Display** | Calendar appearance, branding |
| **Payment** | Stripe, coupons, payment methods |
| **Options** | Event defaults, API access |
| **Admins** | Team member management |
| **Tags** | Organize subscribers |
| **Embed** | Widget code for external sites |
| **Send Limit** | View/request limit increases |
| **Luma Plus** | Premium subscription |

---

## 7. Embed Settings

### Embed Events Widget
```
┌────────────────────────────────────────────────────────────┐
│  Embed Events                                              │
│                                                            │
│  Have your own site? Embed your calendar to easily share   │
│  a live view of your upcoming events.                      │
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │ [◐] [☀️] [🌙]                           [□] [≡]       ││
│  │                                                        ││
│  │ ● Today Tuesday                                        ││
│  │   ✦ LIVE 5:00 AM                                      ││
│  │   ✦ Tech Meetup                    [Event Image]      ││
│  │     👥 By Alex Smith & Sam Lee                        ││
│  │     📹 Zoom                                           ││
│  │   [□ Start Event]  [Manage →]                         ││
│  │                                                        ││
│  │ ● Nov 18 Monday                                        ││
│  │   8:00 AM                                              ││
│  │   ✦ Tech Meetup                    [Event Image]      ││
│  │     👤 By Alex Smith                                  ││
│  │     📹 Zoom                                           ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  Code to Copy                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │ <iframe                                                ││
│  │   src="https://lu.ma/embed/calendar/cal-N3jc..."      ││
│  │   width="600"                                          ││
│  │   height="450"                                         ││
│  │   frameborder="0"                                      ││
│  │   style="border: 1px solid #bfcbda88; border-radius..." ││
│  │   allowfullscreen=""                                   ││
│  │   aria-hidden="false"                                  ││
│  │ </iframe>                                              ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Theme Toggle
| Mode | Icon | Description |
|------|------|-------------|
| **System** | ◐ | Match device preference |
| **Light** | ☀️ | Light background |
| **Dark** | 🌙 | Dark background |

---

## 8. Calendar Status Modal

### Change Status Options
```
┌────────────────────────────────────────────────────────────┐
│  📅                                                        │
│                                                            │
│  Change Status                                             │
│  Choose the desired status for the calendar.               │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ✓ Active                                              │ │
│  │   Make the calendar active and accept subscriptions   │ │
│  │   & event submissions.                                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 📅 Coming Soon                                        │ │
│  │   Show a placeholder coming soon page that visitors   │ │
│  │   can subscribe to.                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🗃️ Archived                                           │ │
│  │   Archive the calendar and stop people from           │ │
│  │   subscribing or submitting events.                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [████████████ Update Status ████████████]                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Status States
| Status | Icon | Behavior |
|--------|------|----------|
| **Active** | ✓ | Full functionality |
| **Coming Soon** | 📅 | Placeholder page, collect subscribers |
| **Archived** | 🗃️ | Read-only, no new subscriptions |

---

## 9. Luma Plus Upgrade

### Pricing Card
```
┌────────────────────────────────────────────────────────────┐
│  Upgrade to                           [Monthly] [Annual]   │
│  Luma Plus                                                 │
│                                                            │
│  $69                                                       │
│  Per month                                                 │
│                                                            │
│  ✓ No Platform Fees                                       │
│  ✓ Priority Support                                       │
│  ✓ 5 Admins Included                                      │
│                                                            │
│  [████████ Upgrade to Luma Plus ████████]                 │
│                                                            │
│  Additional Admins                              $12 / mo   │
├────────────────────────────────────────────────────────────┤
│  Luma Plus Benefits                                        │
│                                                            │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │     $0         │  │     📧         │                   │
│  │ 5% → 0%        │  │ 500 → 5,000    │                   │
│  │ Platform Fee   │  │ invites/week   │                   │
│  └────────────────┘  └────────────────┘                   │
│                                                            │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │     💬?        │  │     🔗         │                   │
│  │ Priority       │  │ API + Zapier   │                   │
│  │ Support        │  │ Access         │                   │
│  └────────────────┘  └────────────────┘                   │
└────────────────────────────────────────────────────────────┘
```

### Benefits Comparison
| Feature | Free | Luma Plus |
|---------|------|-----------|
| **Platform Fee** | 5% | 0% |
| **Invites/Week** | 500 | 5,000 |
| **Support** | Standard | Priority |
| **API Access** | Limited | Full + Zapier |
| **Admins** | 1 | 5 (+ $12/mo each) |

---

## 10. Payment Settings

### Create Coupon Modal
```
┌────────────────────────────────────────────────────────────┐
│  🎫                                                        │
│                                                            │
│  Create Coupon                                             │
│                                                            │
│  Coupon Code                                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ LFT738                                                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Limited Uses                                    [toggle]  │
│                                                            │
│  Total Uses                                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 1                                                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Free] [Percentage] [Amount]                              │
│                                                            │
│  Percent Off                                               │
│  ┌──────────────────┐                                     │
│  │ 50               │ %                                   │
│  └──────────────────┘                                     │
│                                                            │
│  [████████████ Create Coupon ████████████]                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Coupon Types
| Type | Description |
|------|-------------|
| **Free** | 100% discount |
| **Percentage** | % off (e.g., 50%) |
| **Amount** | Fixed $ off |

### Payment Methods Section
- iDEAL (Netherlands)
- Additional regional options

---

## 11. Add Admins Modal

```
┌────────────────────────────────────────────────────────────┐
│  👥                                                        │
│                                                            │
│  Add Admins                                                │
│                                                            │
│  Add admins by entering their email addresses.             │
│  They don't need to have an existing Luma account.        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Paste or enter emails here                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [████████████ Add Admins ████████████]                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 12. Newsletter Editor

### Editor Layout
```
┌────────────────────────────────────────────────────────────┐
│  Demo Product Session > Newsletters >                  ◌  │
│                                                            │
│  Exciting Updates Ahead! Discover What's New              │
│  in Our Product                                           │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  We're thrilled to share the latest improvements and      │
│  features designed to enhance your experience. Dive in    │
│  to explore the updates and learn how they can benefit    │
│  you!                                                      │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  [Continue]  [Preview]                              🗑️    │
└────────────────────────────────────────────────────────────┘
```

### Editor Actions
| Button | Style | Purpose |
|--------|-------|---------|
| **Continue** | Primary dark | Save and proceed |
| **Preview** | Secondary | Preview email |
| **Delete** | Icon (trash) | Discard draft |

---

## 13. Design Tokens Extracted

### Calendar-Specific Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--tint-gray` | `#9ca3af` | Default tint |
| `--tint-pink` | `#ec4899` | Selected tint |
| `--status-live` | `#ef4444` | Live event badge |
| `--status-hosting` | `#ec4899` | Hosting badge |
| `--luma-plus` | `#ec4899` | Plus branding |

### Component Patterns
| Pattern | Usage |
|---------|-------|
| **Pill Toggle** | City/Global, Monthly/Annual, theme modes |
| **Sidebar + Content** | Settings layout |
| **Code Block** | Embed code display |
| **Verification Form** | Compliance forms with checkboxes |
| **Pricing Card** | Feature comparison with benefits grid |
| **Status Radio** | Single-select with descriptions |

---

## 14. UX Patterns Summary

### Calendar Creation Flow
1. Select avatar/logo
2. Upload cover image
3. Enter name + description
4. Choose tint color
5. Set location (city or global)
6. Customize public URL
7. Create calendar

### Settings Organization
- Grouped by function (Display, Payment, Team, etc.)
- Sidebar navigation within settings
- Modals for complex actions (coupons, status)

### Verification Flow
- Required for increased send limits
- Consent-based with explicit checkboxes
- Explains reasoning (spam prevention)

### Embed Pattern
- Live preview with theme toggle
- Copy-ready code block
- Syntax-highlighted iframe code

### Empty States
- Consistent illustration style (hourglass for subscribers)
- Clear headline + helpful description
- Action button visible
