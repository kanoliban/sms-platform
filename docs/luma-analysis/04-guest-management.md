# Guest Management Analysis

> **Category:** 05-guest-management (40 images)
> **Screens:** Invite flows, guest list, filters, people CRM, import

---

## 1. Invite Guests Modal

### Two-Column Layout
```
┌────────────────────────────────────────────────────────────────┐
│  Invite Guests                              ⏱️ 14 LEFT    ✕  │
├─────────────────────────┬──────────────────────────────────────┤
│                         │                                      │
│  ✨ Suggestions         │  Add Emails                          │
│                         │  ┌──────────────────────────────┐   │
│  @ Enter Emails    ●    │  │ Paste or enter emails here   │ Add│
│                         │  └──────────────────────────────┘   │
│  SUBSCRIBERS            │                                      │
│  ● Everyone          0  │  [JM] jsmith.mobbin@gmail.com    ✓  │
│                         │                                      │
│  EVENTS                 │                                      │
│  ◐ This is your first   │                                      │
│    event.               │                                      │
│                         │                                      │
│                         │                                      │
│                         │                                      │
├─────────────────────────┴──────────────────────────────────────┤
│  1 Selected                              [Next >]              │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Left Panel** | Navigation tabs (Suggestions, Enter Emails) |
| **Subscribers** | Quick-select groups from calendar |
| **Events** | Pull attendees from past events |
| **Right Panel** | Email input + selected list |
| **Quota Badge** | "14 LEFT" shows remaining invites |
| **Selection State** | Checkmark on selected emails |
| **Footer** | Selected count + "Next" button |

---

## 2. Send Blast Modal

```
┌────────────────────────────────────────────────────────────────┐
│  ✉️                                                       ✕   │
│                                                                │
│  Send Blast                                                    │
│  Guests will receive the blast via email, SMS or in-app       │
│  notification. It will also be shown on the event page.       │
│                                                                │
│  Recipients                                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [Going ✕] [Invited ✕]                              ⌄    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Subject (Optional)                                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ New message in Tech Meetup                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Message                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Share a message with your guests...                      │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [✈️ Send]  [Schedule]              Preview                   │
└────────────────────────────────────────────────────────────────┘
```

### Recipient Tags (Multi-select)
| Tag | Description |
|-----|-------------|
| **Going** | Confirmed attendees |
| **Invited** | Sent invites, pending response |
| **Waitlist** | Over-capacity queue |
| **Not Going** | Declined invites |

### Action Buttons
| Button | Style | Purpose |
|--------|-------|---------|
| **Send** | Primary dark | Send immediately |
| **Schedule** | Secondary | Pick future time |
| **Preview** | Text link | Preview email |

---

## 3. Guests Tab

### At a Glance Stats Card
```
┌────────────────────────────────────────────────────────────────┐
│  At a Glance                                                   │
│                                                                │
│  1 guest                                            cap 1,000  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  • 1 Going  • 1 Invited                                       │
│                                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │💬 Invite    │ │🔲 Check In   │ │👥 Guest List │           │
│  │   Guests    │ │   Guests     │ │   Hidden     │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
└────────────────────────────────────────────────────────────────┘
```

### Quick Action Cards
| Card | Icon | Description |
|------|------|-------------|
| **Invite Guests** | 💬 (blue) | Opens invite modal |
| **Check In Guests** | 🔲 (pink) | Opens check-in scanner |
| **Guest List** | 👥 (yellow) | Toggle visibility to guests |

### Empty State
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                         👥👤                                   │
│                                                                │
│                    No Guests Yet                               │
│        Share the event or invite people to get started!        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Guest List with Filters

### Filter Dropdown
```
┌────────────────────────┐
│ ✓ All Guests           │
│   Going             1  │
│   Invited           1  │
│   Waitlist          0  │
│   Not Going         0  │
│   Joined            0  │
└────────────────────────┘
```

### Sort Options
| Option | Description |
|--------|-------------|
| **Register Time** | Chronological by registration |
| **Name** | Alphabetical |

### Guest Row
```
┌────────────────────────────────────────────────────────────────┐
│ 👤 Alex Smith  alexsmith@gmail.com  [Standard] [Going] 11h Ago│
└────────────────────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| **Avatar** | Profile image or initials |
| **Name** | Display name |
| **Email** | Contact email |
| **Ticket Type** | Badge (Standard, Company, etc.) |
| **Status** | Going/Invited/Pending badge |
| **Timestamp** | Relative time since action |

### Status Badges
| Status | Color | Meaning |
|--------|-------|---------|
| **Going** | Green | Confirmed attendance |
| **Invited** | Blue | Invitation sent |
| **Pending Approval** | Orange | Awaiting host approval |
| **Waitlist** | Gray | Over capacity |
| **Not Going** | Red | Declined |

---

## 5. Registration Tab

### Settings Cards
```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │🎫 Registration│ │📊 Event     │ │👥 Group      │            │
│ │   Open       │ │   Capacity   │ │   Registration│           │
│ │              │ │   1,000 ·    │ │   Off        │            │
│ │              │ │   Waitlist On│ │              │            │
│ └──────────────┘ └──────────────┘ └──────────────┘            │
└────────────────────────────────────────────────────────────────┘
```

### Tickets Section
```
┌────────────────────────────────────────────────────────────────┐
│  Tickets                                 [+ New Ticket Type] ≡ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ✦ + stripe  Start Selling. Collect payments by creating  │ │
│  │             a Stripe account. Receive payouts daily.      │ │
│  │             Set up in under 5 minutes.     [Get Started] ✕│ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Standard   Free  [Require Approval]           1 registered ⋯ │
│  Company    Free                               0 registered ⋯ │
└────────────────────────────────────────────────────────────────┘
```

### Registration Emails
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│      ◐       │  │      ✓       │  │      ✕       │
│  ━━━━━━━━━━  │  │  ━━━━━━━━━━  │  │  ━━━━━━━━━━  │
│  ━━━━━━      │  │  ━━━━━━      │  │  ━━━━━━      │
│              │  │              │  │              │
│ Pending      │  │ Going        │  │ Declined     │
│ Approval /   │  │              │  │              │
│ Waitlist     │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

| Email Type | Trigger | Icon |
|------------|---------|------|
| **Pending Approval / Waitlist** | On registration (approval required) | Gray checkmark |
| **Going** | On approval or free registration | Green checkmark |
| **Declined** | On rejection | Red X |

---

## 6. People / CRM (Calendar Level)

### People List
```
┌────────────────────────────────────────────────────────────────┐
│  Demo Product Session                      [Calendar Page ↗]  │
│  [Events] [People] [Newsletters] [Insights] [Settings]        │
│           ──────                                               │
├────────────────────────────────────────────────────────────────┤
│  People (2)                                    [+ Add People]  │
│                                                                │
│  🔍 Search                                              ⬇️    │
│  🔽 Filter ⌄                               Recently Joined ⌄  │
│                                                                │
│  👤 doe  ● jdoe.mobbin@gmail.com                              │
│  👤 John ● jsmith.mobbin@gmail.com                            │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│  Subscribers                                                   │
│  When people subscribe to your calendar, they will appear here│
└────────────────────────────────────────────────────────────────┘
```

### Confirm Import Modal
```
┌────────────────────────────────────────────────────────────────┐
│  <  Confirm Import                                        ✕   │
├────────────────────────────────────────────────────────────────┤
│  🎭  Importing 2 people                                       │
│      john and doe                                              │
│                                                                │
│  Apply Tags                                                    │
│  [+ Add Tag]                                                   │
│                                                                │
│  Choose tag color                                              │
│  ● Red                                                         │
│  ● Cranberry                                                   │
│  ● Orange                                                      │
│  ● Yellow                                                      │
│  ● Green                                                       │
│  ● Blue                                                        │
│  ● Purple                                                      │
│  ● Barney                                                      │
│                                                                │
│  [████████ Start Import ████████]                             │
│                                                                │
│  ⚠️ Only import people who have consented to receive emails.  │
│     Doing otherwise can risk an account suspension.           │
└────────────────────────────────────────────────────────────────┘
```

### Tag Color Palette
| Color | Name |
|-------|------|
| 🔴 | Red |
| 🔴 | Cranberry |
| 🟠 | Orange |
| 🟡 | Yellow |
| 🟢 | Green |
| 🔵 | Blue |
| 🟣 | Purple |
| 🟣 | Barney |

---

## 7. Person Detail Slide-over

```
┌────────────────────────────────────────────────────────────────┐
│  ≫                                                    ∧  ∨   │
├────────────────────────────────────────────────────────────────┤
│  👤 doe                                              ⋯        │
│     jdoe.mobbin@gmail.com                                     │
│                                                                │
│  ┌──────────┬──────────┬──────────┬──────────┐               │
│  │ Joined On│ # Events │ # Check  │ Revenue  │               │
│  │ Nov 12   │ 0        │ Ins 0    │ $0.00    │               │
│  └──────────┴──────────┴──────────┴──────────┘               │
│                                                                │
│  [+ Add Tag]                                                   │
│                                                                │
│  Events                                                        │
│  No events attended.                                           │
│                                                                │
│  Payments                                                      │
│  This member hasn't paid you, yet.                            │
│                                                                │
│                                           ┌─────────────────┐ │
│                                           │ 👤 Remove       │ │
│                                           │ 🚫 Block        │ │
│                                           └─────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Person Stats
| Stat | Description |
|------|-------------|
| **Joined On** | Date first added |
| **# Events** | Events attended |
| **# Check Ins** | Physical check-ins |
| **Revenue** | Total paid |

### Actions Dropdown
| Action | Icon | Effect |
|--------|------|--------|
| **Remove** | 👤 | Remove from people list |
| **Block** | 🚫 | Block from all events |

---

## 8. Toast Notifications

### Approval Success
```
┌────────────────────────────────────────────────────────────────┐
│  ✓  Guest approved.                                           │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Position** | Bottom center |
| **Background** | Green (`#22c55e`) |
| **Duration** | ~3 seconds |
| **Animation** | Slide up + fade |

---

## 9. Design Tokens Extracted

### Status Colors
| Status | Background | Text |
|--------|------------|------|
| **Going** | `#dcfce7` | `#16a34a` |
| **Invited** | `#dbeafe` | `#2563eb` |
| **Pending Approval** | `#fef3c7` | `#d97706` |
| **Waitlist** | `#f3f4f6` | `#6b7280` |
| **Not Going** | `#fee2e2` | `#dc2626` |

### Tag Colors (8-color palette)
```css
--tag-red: #ef4444;
--tag-cranberry: #be185d;
--tag-orange: #f97316;
--tag-yellow: #eab308;
--tag-green: #22c55e;
--tag-blue: #3b82f6;
--tag-purple: #8b5cf6;
--tag-barney: #a855f7;
```

### Component Patterns
| Pattern | Usage |
|---------|-------|
| **Multi-select tags** | Recipient selection, filters |
| **Action cards** | Quick actions with icons |
| **Stats row** | Horizontal metrics display |
| **Slide-over panel** | Detail views without leaving context |
| **Empty state** | Icon + title + description + CTA |

---

## 10. UX Patterns Summary

### Invitation Flow
1. Open modal → select sources (suggestions, email entry, past events)
2. Select recipients → see count update
3. Click "Next" → confirm and send

### Approval Workflow
1. Guest registers → status = "Pending Approval"
2. Host sees notification badge
3. Host clicks to approve/decline
4. Guest receives email notification
5. Toast confirms action

### People CRM Features
- Import with consent warning
- Tag-based organization (8 colors)
- Per-person stats tracking
- Block/remove capabilities

### Empty States
- Friendly illustration (dual user icons)
- Clear headline ("No Guests Yet")
- Actionable description
- Implicit CTA (mentions invite/share)
