# Event Pages (Public) Analysis

> **Category:** 03-event-pages-public (10 images)
> **Screens:** Public event view, registration flow, guest interactions

---

## 1. Public Event Page Layout

### Two-Column Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Events    Calendars    Discover       12:55 PM GMT+7  Create Event │
├──────────────────────────┬──────────────────────────────────────────┤
│                          │  Featured in Singapore >                  │
│  ┌────────────────────┐  │                                          │
│  │                    │  │  Ruby SG November                        │
│  │   Cover Image      │  │  Meetup                                  │
│  │   (Event Theme)    │  │                                          │
│  │                    │  │  📅 Wednesday, November 13               │
│  │   RubySG           │  │     6:30 PM - 8:30 PM GMT+8              │
│  │   November         │  │                                          │
│  │   Meetup           │  │  📍 ARC 380 ↗                           │
│  └────────────────────┘  │     Singapore                            │
│                          │                                          │
│  Presented by            │  ┌────────────────────────────────────┐  │
│  🔴 RubySG Meetups >     │  │  You're In                         │  │
│                          │  │  A confirmation email has been     │  │
│  Home of the Ruby        │  │  sent to alex@gmail.com            │  │
│  community in Singapore  │  │                                    │  │
│                          │  │  📅 Add to Calendar  🌐  ✉️  🔗 Invite│
│  🌐                      │  │                                    │  │
│                          │  │  No longer able to attend?         │  │
│  Hosted By               │  │  canceling your registration       │  │
│  👤 Ted Johansson        │  └────────────────────────────────────┘  │
│  👤 Onur Ozer     𝕏      │                                          │
│                          │  Get Ready for the Event              >  │
│  37 Going                │  Profile Complete · Reminder: Email      │
│  👥👥👥👥👥               │                                          │
│  Elisha Tan, Ryan...     │  About Event                             │
│                          │  Hi Rubyists! 👋                         │
│  Contact the Host        │  We have an exciting talk...             │
│  Report Event            │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Left Column** | ~40% - Cover image, calendar info, hosts, attendees |
| **Right Column** | ~60% - Event details, RSVP status, description |
| **Cover Image** | Full-width, themed background with event title |
| **Featured Badge** | "Featured in {City}" link at top |
| **Starting In** | Pink countdown timer (e.g., "Starting in 1d 1h") |

---

## 2. RSVP Confirmation State

### "You're In" Card
```
┌────────────────────────────────────────────────────────────────┐
│  👤                                        Starting in 1d 1h   │
│                                                                │
│  You're In                                                     │
│  A confirmation email has been sent to                         │
│  alexsmith.mobbin+1@gmail.com.                                 │
│                                                                │
│  📅 Add to Calendar    🌐    ✉️    🔗 Invite a Friend          │
│                                                                │
│  No longer able to attend? Notify the host by                  │
│  canceling your registration.                                  │
└────────────────────────────────────────────────────────────────┘
```

### Action Icons Row
| Icon | Action |
|------|--------|
| **📅 Add to Calendar** | Download .ics or add to Google/Apple |
| **🌐** | Share to social |
| **✉️** | Email invite |
| **🔗 Invite a Friend** | Copy invite link |

### Get Ready Expandable
```
┌────────────────────────────────────────────────────────────────┐
│  Get Ready for the Event                                    >  │
│  Profile Complete · Reminder: Email                            │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Registration Form

### Your Info Modal
```
┌────────────────────────────────────────────────────────────────┐
│  Your Info                                                 ✕   │
├────────────────────────────────────────────────────────────────┤
│  Email *                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ alexsmith.mobbin+1@gmail.com                     Edit ✓  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Name *                                                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Alex Smith                                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Custom Question - e.g., Company]                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [██████████████ Register ██████████████]                     │
└────────────────────────────────────────────────────────────────┘
```

| Field | Specification |
|-------|---------------|
| **Email** | Pre-filled if logged in, with Edit + checkmark |
| **Name** | Required, text input |
| **Custom Questions** | Event-specific fields (optional) |
| **Register Button** | Primary dark, full-width |

---

## 4. Registration Success Toast

```
┌────────────────────────────────────────────────────────────────┐
│  ✓  Thank you for registering!                                 │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Position** | Bottom center, overlaying content |
| **Background** | Green (`#22c55e`) |
| **Icon** | White checkmark |
| **Duration** | ~3 seconds auto-dismiss |

---

## 5. Contact the Host Modal

```
┌────────────────────────────────────────────────────────────────┐
│  ✉️                                                        ✕   │
│                                                                │
│  Contact the Host                                              │
│  Have a question about the event? You can                      │
│  send a message to the host.                                   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ What's your question for the host?                       │ │
│  │                                                          │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  The host will send replies to                                 │
│  alexsmith.mobbin+1@gmail.com.                                 │
│                                                                │
│  [██████████████ Send Message ██████████████]                 │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Icon** | Envelope in rounded square |
| **Textarea** | Multi-line input with placeholder |
| **Reply Info** | Shows where replies will be sent |
| **CTA** | "Send Message" - Primary dark button |

---

## 6. Report Event Modal

```
┌────────────────────────────────────────────────────────────────┐
│  🚨                                                        ✕   │
│                                                                │
│  Report Event                                                  │
│  Please share more information about why you                   │
│  are reporting this event.                                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Any information you can share will be                    │ │
│  │ very helpful.                                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [██████████████ Submit Report ██████████████]                │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Icon** | Red warning icon |
| **CTA** | "Submit Report" - Red/coral button (`#f43f5e`) |
| **Textarea** | Placeholder explains what to share |

---

## 7. Event Sidebar (Left Column)

### Hosted By Section
```
┌────────────────────────────────────────────────────────────────┐
│  Hosted By                                                     │
│                                                                │
│  👤 Ted Johansson                                              │
│  👤 Onur Ozer                                             𝕏    │
└────────────────────────────────────────────────────────────────┘
```

### Attendee Count Section
```
┌────────────────────────────────────────────────────────────────┐
│  37 Going                                                      │
│  👥👥👥👥👥                                                    │
│  Elisha Tan, Ryan Teo and 35 others                           │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Avatar Stack** | 5 overlapping circles (32px each) |
| **Names** | First 2 names + "and X others" |
| **Host Social** | Twitter/X icon for linked accounts |

### Footer Links
| Link | Action |
|------|--------|
| **Contact the Host** | Opens contact modal |
| **Report Event** | Opens report modal |

---

## 8. Event Slide-over Panel

### From Events List View
```
┌────────────────────────────────────────────────────────────────┐
│  ≫                                       Copy Link  Event Page ↗│
│                                                    ∧  ∨        │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │           [Event Cover Image]                            │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Ruby SG November Meetup                                       │
│  🔴 RubySG Meetups >                                          │
│                                                                │
│  📅 Wednesday, November 13                                     │
│     6:30 PM - 8:30 PM GMT+8                                   │
│                                                                │
│  📍 ARC 380 ↗                                                 │
│     Singapore                                                  │
│                                                                │
│  [You're In confirmation card...]                             │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Collapse Button** | ≫ icon to close panel |
| **Navigation** | ∧ ∨ arrows to browse events |
| **Actions** | "Copy Link" + "Event Page ↗" |
| **Width** | ~400px right-aligned |

---

## 9. Design Tokens Extracted

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--starting-soon` | `#ec4899` | Pink countdown timer |
| `--success-green` | `#22c55e` | Registration success toast |
| `--report-red` | `#f43f5e` | Report button |
| `--link-blue` | `#2563eb` | Cancel registration link |
| `--featured-badge` | `#f97316` | Singapore/city badge |

### Component Patterns
| Pattern | Usage |
|---------|-------|
| **Split layout** | 40/60 columns for event pages |
| **Slide-over panel** | Quick view from list without navigation |
| **Action icon row** | Calendar, share, invite horizontally |
| **Stacked avatars** | Show attendee count visually |
| **Toast notification** | Success confirmation bottom-center |

---

## 10. UX Patterns Summary

### Registration Flow
1. View event page → see event details
2. Click Register → "Your Info" modal
3. Fill required fields (email pre-filled if logged in)
4. Submit → Success toast + "You're In" card
5. Add to calendar or invite friends

### Guest Interactions
- **Contact Host:** Question form with email routing
- **Report Event:** Flagging with reason textarea
- **Cancel Registration:** Link in confirmation card
- **Invite Friends:** Share link generation

### Information Hierarchy
- Cover image + title (visual anchor)
- Date/time/location (key logistics)
- RSVP status card (primary action)
- About section (detailed description)
- Hosts + attendees (social proof)

### Visual Feedback
- Countdown timer shows urgency
- Avatar stacks show social proof
- Success toast confirms registration
- "You're In" replaces Register button
