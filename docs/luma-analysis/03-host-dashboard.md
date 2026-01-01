# Host Dashboard Analysis

> **Category:** 04-host-dashboard (50 images)
> **Screens:** Overview, Guests, Registration, Blasts, Insights, More

---

## 1. Dashboard Structure

### Tab Navigation
```
[Overview] [Guests] [Registration] [Blasts] [Insights] [More]
     ─────
```

| Tab | Purpose |
|-----|---------|
| **Overview** | At-a-glance stats, guest preview, hosts, visibility |
| **Guests** | Full guest list with filters and actions |
| **Registration** | Form builder, approval settings, custom questions |
| **Blasts** | Email communications to guests |
| **Insights** | Analytics and engagement metrics |
| **More** | Clone, URL, embed, cancel event |

### Page Header
```
┌──────────────────────────────────────────────────────────────┐
│  Personal >                                   [Event Page ↗] │
│  ✦ Tech Meetup                                              │
│  [Overview] [Guests] [Registration] [Blasts] [Insights] [More]
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Overview Tab

### Guest Summary Card
```
┌────────────────────────────────────────────────────────────┐
│  Guests                                                    │
│                                                            │
│  1 guest                                        cap 1,000  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  • 1 Going  • 1 Invited                                    │
│                                                            │
│  Recent Registrations                     [All Guests →]   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Alex Smith  alexsmith@gmail.com   Going  11h Ago │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Progress Bar** | Thin gray track with colored fill |
| **Stats** | Color-coded dots: Going (green), Invited (blue) |
| **Guest Row** | Avatar, name, email, status badge, timestamp |
| **Link** | "All Guests →" text link |

### Hosts Section
```
┌────────────────────────────────────────────────────────────┐
│  Hosts                                     [+ Add Host] ≡  │
│  Add hosts, special guests, and event managers.            │
│                                                            │
│  👤 Alex Smith  alexsmith@gmail.com   [Creator]       ✏️   │
│  👤 Sam Lee     samlee@gmail.com      [Manager]       ✏️   │
│                                                            │
│  Learn more about adding hosts / managers ↗               │
└────────────────────────────────────────────────────────────┘
```

### Host Role Badges
| Role | Color | Permissions |
|------|-------|-------------|
| **Creator** | Orange | Full access, ownership |
| **Manager** | Green | Full manage access to event |
| **Check-In Only** | Gray | Check in guests, view list (Luma Plus) |
| **Non-Manager** | Gray | No manage event access |

### Visibility & Discovery Section
```
┌────────────────────────────────────────────────────────────┐
│  Visibility & Discovery                                    │
│  Control how people can find your event.                   │
│                                                            │
│  👤  Managing Calendar                                     │
│      Your Personal Calendar                                │
│      ✦ Private — This event is not listed on...           │
│                                                            │
│  [👁 Change Visibility]  [📅 Transfer Calendar]            │
│                                                            │
│  ⓘ To be eligible for being featured on Luma discovery    │
│    pages and community calendars, please set visibility... │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Share Event Modal

```
┌────────────────────────────────────────────────────────────┐
│  ↗                                                    ✕   │
│                                                            │
│  Share This Event                                          │
│                                                            │
│  [f]      [X]      [in]     [✉]      [↗]                  │
│  Share    Tweet    Post     Email    Share                 │
│                                                            │
│  [💬]                                                      │
│  Text                                                      │
│                                                            │
│  Share the link:                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ https://lu.ma/bffi7c7z              [Copied!]        │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

| Platform | Icon | Action |
|----------|------|--------|
| Facebook | `f` | Opens share dialog |
| X/Twitter | `X` | Opens tweet compose |
| LinkedIn | `in` | Opens post dialog |
| Email | `✉` | Opens email client |
| Share | `↗` | Native share sheet |
| Text | `💬` | Opens SMS |

**Copy Link Pattern:**
- Input shows shortened URL (`lu.ma/xxxxx`)
- "Copy" button → transforms to "Copied!" on success
- Success state is temporary (reverts after ~2s)

---

## 4. Invite Stats Panel (Slide-over)

```
┌────────────────────────────────────────────────────────────┐
│  ≫  Invite Stats                                          │
├────────────────────────────────────────────────────────────┤
│  All Invites                                               │
│                                                            │
│  Sent 2    Accepted 1    Declined 0    Outstanding 1      │
│            ─────────                                       │
│                                                            │
│  👤 Alex Smith  alexsmith@gmail.com           [Going]     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

| Stat | Description |
|------|-------------|
| **Sent** | Total invitations sent |
| **Accepted** | RSVPs marked "Going" |
| **Declined** | RSVPs declined |
| **Outstanding** | Pending responses |

---

## 5. Update Host Modal

```
┌────────────────────────────────────────────────────────────┐
│  👥                                                        │
│                                                            │
│  Update Host                                               │
│  Sam Lee · samlee@gmail.com                                │
│                                                            │
│  Show on the Event Page                           [●───]   │
│                                                            │
│  Access Control                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 👤 Manager                                       ✓   │ │
│  │    Full manage access to the event                   │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 👤 Check-In Only                                     │ │
│  │    Check in guests and view guest list               │ │
│  │    Requires Luma Plus                                │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 👤 Non-Manager                                       │ │
│  │    No manage event access                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [Update Host]            [Remove Host]                    │
│       ■                       red text                     │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Registration Tab

### Add Question Modal
```
┌────────────────────────────────────────────────────────────┐
│  🔲+                                                  ✕   │
│                                                            │
│  Add Question                                              │
│  Ask guests custom questions when they register.           │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │ 📝 Text     │  │ ≡ Options   │                         │
│  └─────────────┘  └─────────────┘                         │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │ 🌐 Social   │  │ 🏢 Company  │                         │
│  │    Profile  │  │             │                         │
│  └─────────────┘  └─────────────┘                         │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │ ☑️ Checkbox │  │ 📋 Terms    │                         │
│  └─────────────┘  └─────────────┘                         │
│  ┌─────────────┐                                          │
│  │ 🔗 Website  │                                          │
│  └─────────────┘                                          │
└────────────────────────────────────────────────────────────┘
```

### Question Types
| Type | Icon | Use Case |
|------|------|----------|
| **Text** | 📝 | Free-form text input |
| **Options** | ≡ | Single/multi-select dropdown |
| **Social Profile** | 🌐 | LinkedIn, Twitter links |
| **Company** | 🏢 | Organization name |
| **Checkbox** | ☑️ | Yes/no agreement |
| **Terms** | 📋 | Terms acceptance |
| **Website** | 🔗 | URL input |

### Registration Questions Layout
```
Personal Information
├── Name        Required
├── Email       Required
└── Phone       Off ⌄

Web3 Identity
├── ETH Address    Off ⌄
└── SOL Address    Off ⌄

Custom Questions
└── [+ Add Question]
```

---

## 7. Blasts Tab

### Schedule Feedback Email (Slide-over)
```
┌────────────────────────────────────────────────────────────┐
│  ≫  Schedule Feedback Email                               │
├────────────────────────────────────────────────────────────┤
│  When should the feedback email be sent?                   │
│                                                            │
│  ┌────────────────────────┐  ┌──────────┐                 │
│  │ Tue, Nov 12            │  │ 15.30    │                 │
│  └────────────────────────┘  └──────────┘                 │
│  🌐 GMT-08:00 Los Angeles                                 │
│  Immediately after the event ends                         │
│                                                            │
│  Subject                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Thanks for joining  Event Name                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Body                                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Add your custom message here.                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  What did you think of Tech Meetup?                       │
│  [😍] [😢] [😐] [🙂] [🤩]                                  │
│                                                            │
│  [🔔 Schedule Feedback Email]                             │
└────────────────────────────────────────────────────────────┘
```

**Emoji Rating Scale:** 5 levels from negative to very positive.

---

## 8. More Tab

### Clone Event Section
```
┌────────────────────────────────────────────────────────────┐
│  Clone Event                                               │
│  Create a new event with the same information as this one. │
│  Everything except the guest list and event blasts will    │
│  be copied over.                                           │
│                                                            │
│  [📋 Clone Event]                                          │
└────────────────────────────────────────────────────────────┘
```

### Event Page URL Section
```
┌────────────────────────────────────────────────────────────┐
│  Event Page                                                │
│  When you choose a new URL, the current one will no longer │
│  work. Do not change your URL if you have already shared.  │
│                                                            │
│  ┌─────────────────────────────────────────────────────────┐
│  │ Upgrade to Luma Plus to set a custom URL  [Learn More] │
│  └─────────────────────────────────────────────────────────┘
│                                                            │
│  Public URL                                                │
│  lu.ma/ [bffi7c7z_____________] [Update]                   │
└────────────────────────────────────────────────────────────┘
```

### Embed Event Section
```
┌────────────────────────────────────────────────────────────┐
│  Embed Event                                               │
│  Have your own site? Embed the event to let visitors know. │
│                                                            │
│  [💬 Embed as Button ✓]  [📄 Embed Event Page]             │
│                                                            │
│  Paste the following HTML code snippet to your page:       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ <a href="https://..."                               │ │
│  │   class="luma-checkout--button"                     │ │
│  │   data-luma-action="checkout"                       │ │
│  │   data-luma-event-id="..."                          │ │
│  │ >                                                   │ │
│  │   Register for Event                                │ │
│  │ </a>                                                │ │
│  │ <script id="luma-checkout"...></script>             │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Choose Times Modal (Recurring Events)
```
┌────────────────────────────────────────────────────────────┐
│  <  Choose Times                                      ✕   │
├────────────────────────────────────────────────────────────┤
│  Starting on                                               │
│  ┌────────────────────────┐  ┌──────────┐                 │
│  │ Mon, Dec 9             │  │ 08.00    │                 │
│  └────────────────────────┘  └──────────┘                 │
│                                                            │
│  Repeats                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Weekly                                           ⌄   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Days of the week                                          │
│  [M●] [T] [W] [T] [F] [S] [S]                              │
│                                                            │
│  [Until] [For ●]  >  [6] weeks                             │
│                                                            │
│  ┌─────┐┌─────┐    ┌─────┐┌─────┐                         │
│  │ DEC ││ DEC │ +2 │ JAN ││ JAN │                         │
│  │  9  ││ 16  │    │  6  ││ 13  │                         │
│  │ MON ││ MON │    │ MON ││ MON │                         │
│  └─────┘└─────┘    └─────┘└─────┘                         │
│                                                            │
│  You can add up to 6 times at once.                       │
│                                                            │
│  [████████ Add 6 Times ████████]                          │
└────────────────────────────────────────────────────────────┘
```

---

## 9. Cancel Event Modal (Destructive)

```
┌────────────────────────────────────────────────────────────┐
│  🗑️ (red)                                                  │
│                                                            │
│  Cancel Event                                              │
│                                                            │
│  If you aren't able to host your event, you can cancel    │
│  and we'll notify your guests.                            │
│                                                            │
│  Customize Email                              [●───]       │
│                                                            │
│  Subject                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Tech Meetup was canceled                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Body                                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Add your custom message here.                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  [████████ Cancel Event ████████]                         │
│            (red button)                                    │
│                                                            │
│  The event will be permanently deleted.                   │
│          (red warning text)                                │
└────────────────────────────────────────────────────────────┘
```

### Destructive Action Pattern
| Element | Style |
|---------|-------|
| **Icon** | Red/danger color |
| **Warning** | Red text below button |
| **Primary Action** | Red background button |
| **Customization** | Allow custom message to guests |

---

## 10. Toast Notifications

### Success Toast
```
┌────────────────────────────────────────────────────────────┐
│  ✓  We sent an email invite to Sam Lee.                   │
└────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Position** | Bottom center of viewport |
| **Background** | Green (`#22c55e`) |
| **Icon** | White checkmark |
| **Text** | White, descriptive action |
| **Duration** | ~3-4 seconds |

---

## 11. Design Tokens Extracted

### Status Badge Colors
| Status | Background | Text |
|--------|------------|------|
| **Going** | `#dcfce7` | `#16a34a` (green) |
| **Invited** | `#dbeafe` | `#2563eb` (blue) |
| **Creator** | `#ffedd5` | `#ea580c` (orange) |
| **Manager** | `#dcfce7` | `#16a34a` (green) |
| **Pending** | `#fef3c7` | `#d97706` (amber) |

### Modal Patterns
| Type | Width | Header Icon | Primary Button |
|------|-------|-------------|----------------|
| **Standard** | ~400px | Outlined icon | Dark/teal |
| **Destructive** | ~400px | Red icon | Red |
| **Slide-over** | ~360px | Chevron + title | Dark |

### Recurring Event Chips
```
┌─────┐
│ DEC │  ← Month label
│  9  │  ← Day number (large)
│ MON │  ← Day name
└─────┘
```

---

## 12. UX Patterns Summary

### Information Architecture
- **Progressive disclosure**: Tabs reveal features as needed
- **Contextual actions**: Edit buttons inline with content
- **Stats at-a-glance**: Numbers with visual progress indicators

### Communication Patterns
- **Pre-event**: Invites, blasts, reminders
- **Post-event**: Feedback emails with emoji ratings
- **System messages**: Configurable notifications

### Access Control
- **Role-based**: Creator > Manager > Check-In > Non-Manager
- **Granular toggles**: Show on event page, email customization
- **Upsell integration**: "Requires Luma Plus" labels

### Destructive Actions
- **Confirmation**: Always require explicit action
- **Customization**: Allow messaging to affected users
- **Warning**: Clear red visual treatment
- **Consequences**: Explain what will happen
