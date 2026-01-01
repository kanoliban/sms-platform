# Discover & Explore Analysis

> **Category:** 09-discover-explore (20 images)
> **Screens:** Discover page, city pages, search, event submission

---

## 1. Discover Events Page

### Main Layout
```
┌────────────────────────────────────────────────────────────────┐
│  Events    Calendars    ◉ Discover     4:26 PM GMT+7  Create   │
│                         ─────────                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Discover Events                                               │
│                                                                │
│  Explore popular events near you, browse by category, or      │
│  check out some of the great community calendars.             │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Popular Events                                                │
│  Singapore                                        View All →   │
│                                                                │
│  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │ [Cover Image]       │  │ [Cover Image]       │             │
│  │                     │  │                     │             │
│  │ GenAI: Beyond       │  │ Ruby SG November    │             │
│  │ Borders | TGB x     │  │ Meetup              │             │
│  │ Hatch               │  │                     │             │
│  │ Today, 6:30 PM      │  │ Tomorrow, 6:30 PM   │             │
│  │                     │  │ ARC 380             │             │
│  │ 👥👥👥              │  │ 👥👥👥👥            │             │
│  └─────────────────────┘  └─────────────────────┘             │
│                                                                │
│  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │ Education 4.0       │  │ Startup Ecosystem   │             │
│  │ What's Next for     │  │ Mixer: Founders     │             │
│  │ EdTech...           │  │ Huddle 6            │             │
│  └─────────────────────┘  └─────────────────────┘             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Event Card Components
| Element | Specification |
|---------|---------------|
| **Cover Image** | Square/rounded thumbnail |
| **Event Title** | Bold, max 2 lines |
| **Date/Time** | Relative ("Today", "Tomorrow") + time |
| **Location** | Venue name (if physical) |
| **Attendee Avatars** | Stacked circles showing social proof |

---

## 2. Explore Local Events Section

### Region Tab Navigation
```
┌────────────────────────────────────────────────────────────────┐
│  Explore Local Events                                          │
│                                                                │
│  [Asia & Pacific] [Africa] [Europe] [Americas]                │
│   ─────────────                                                │
│                                                                │
│  🔴 Bangkok        🔴 Bengaluru      🔴 Dubai        🔴 Ho Chi │
│     53 Events         26 Events        14 Events      6 Events│
│                                                                │
│  🔴 Hong Kong      🔴 Jakarta        🔴 Kuala Lumpur 🔴 Manila │
│     11 Events         6 Events         12 Events      12 Events│
│                                                                │
│  🔴 Melbourne      🔴 Mumbai         🔴 New Delhi    🔴 Seoul  │
│     10 Events         12 Events        11 Events      2 Events│
└────────────────────────────────────────────────────────────────┘
```

### City Card
| Element | Specification |
|---------|---------------|
| **Icon** | Colored circle with city-specific design |
| **City Name** | Bold text |
| **Event Count** | "X Events" in muted text |
| **Grid** | 4 columns on desktop |

### Region Tabs
| Tab | Regions Included |
|-----|------------------|
| **Asia & Pacific** | SEA, ANZ, East Asia |
| **Africa** | All African cities |
| **Europe** | EU, UK, Eastern Europe |
| **Americas** | North, Central, South America |

---

## 3. City Discover Page

### Hero Layout
```
┌────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │              [City Hero Image]                           │ │
│  │                                                          │ │
│  │  👤                                                      │ │
│  │                                                          │ │
│  │  What's Happening in                                     │ │
│  │  Singapore                                               │ │
│  │  ⏱️ 9:10 PM GMT+8                                        │ │
│  │                                                          │ │
│  │  Singapore's events span tech, innovation, and culture.  │ │
│  │  From sunrise fitness sessions to fashion shows, the     │ │
│  │  city is a hub for forward-thinkers...                   │ │
│  │                                                          │ │
│  │  [Subscribe]                                             │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Events                            + Submit Event   📡   🔍   │
│                                                                │
│  • Today Tuesday                                               │
│                                                                │
│  6:30 PM                                                       │
│  GenAI: Beyond Borders | TGB x Hatch        [Sold Out]        │
│  By Shivang Gupta (TGB)                              [🖼️]     │
│  📍 Singapore                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Hero Elements
| Element | Specification |
|---------|---------------|
| **Background** | Full-bleed city image with overlay |
| **Icon** | City avatar/logo |
| **Title** | "What's Happening in {City}" |
| **Local Time** | Current time in city timezone |
| **Description** | 2-3 sentences about city's event scene |
| **Subscribe CTA** | White button on dark overlay |

### City Sidebar
```
┌────────────────────────────────────────────────────────────────┐
│  Singapore                                                     │
│  Discover the hottest events in Singapore, and get             │
│  notified of new events before they sell out.                  │
│                                                                │
│  [████████████ Subscribe ████████████]                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │              [City Map]                                  │ │
│  │                 📍5                                       │ │
│  │                    📍11                                   │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Submit Event Modal

```
┌────────────────────────────────────────────────────────────────┐
│  ☆                                                         ✕   │
│                                                                │
│  Submit Event                                                  │
│  Submit your event to be featured on this page                 │
│  and the weekly newsletter. Please follow our                  │
│  guidelines to increase your chance to be featured.            │
│                                                                │
│  Luma Event Link                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ https://lu.ma/bffi7c7z                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [🖼️] Tech Meetup                                         │ │
│  │      Mon, Nov 11, 2:00 PM PST                            │ │
│  │                                                          │ │
│  │  ⚠️ This event cannot be submitted because:              │ │
│  │                                                          │ │
│  │  • The event must have a physical location.              │ │
│  │  • The event must have at least 3 registrations.         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [██████████████ Submit ██████████████]                       │
└────────────────────────────────────────────────────────────────┘
```

### Submission Requirements
| Requirement | Description |
|-------------|-------------|
| **Physical Location** | Virtual-only events cannot be featured |
| **Minimum Registrations** | At least 3 confirmed attendees |
| **Guidelines** | Link to editorial guidelines |

### Validation States
| State | Display |
|-------|---------|
| **Valid** | Green checkmark, Submit enabled |
| **Invalid** | Orange warning, requirements listed |
| **Loading** | Spinner while fetching event details |

---

## 5. Command Palette / Search

### Search Modal
```
┌────────────────────────────────────────────────────────────────┐
│  🔍 Search events, calendars, or people...                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Shortcuts                                                     │
│                                                                │
│  🏠 Go to Events                                          ⌘ 1 │
│  📅 Go to Calendars                                       ⌘ 2 │
│  🧭 Go to Discover                                        ⌘ 3 │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Your Calendars                                                │
│                                                                │
│  🔲 Demo Product Session                                       │
│  👤 Personal Calendar                                          │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Events You're Hosting                                         │
│                                                                │
│  🎤 Tech Meetup                                                │
│  📅 Ruby SG November Meetup                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Search Categories
| Section | Content |
|---------|---------|
| **Shortcuts** | Navigation with keyboard shortcuts |
| **Your Calendars** | Calendars you manage |
| **Events You're Hosting** | Upcoming hosted events |
| **Recent Searches** | Previously searched terms |

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| **⌘ 1** | Go to Events |
| **⌘ 2** | Go to Calendars |
| **⌘ 3** | Go to Discover |
| **⌘ K** | Open search (assumed) |

---

## 6. Events List View

### Timeline Layout
```
┌────────────────────────────────────────────────────────────────┐
│  Events                           + Submit Event   📡   🔍    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  • Today Tuesday                                               │
│                                                                │
│    6:30 PM                                                     │
│    GenAI: Beyond Borders | TGB x Hatch            [Sold Out]  │
│    🔴 By Shivang Gupta (TGB)                           [🖼️]   │
│    📍 Singapore                                                │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  • Tomorrow Wednesday                                          │
│                                                                │
│    6:30 PM                                                     │
│    Ruby SG November Meetup                         👥👥👥+28  │
│    🔴🔴 By Ted Johansson & Onur Ozer                   [🖼️]   │
│    📍 ARC 380                                                  │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  • Nov 14 Thursday                                             │
│                                                                │
│    2:00 PM                                                     │
│    Education 4.0: What's Next for EdTech...        👥👥👥+104 │
│    🔴 By BLOCK71 Global                                [🖼️]   │
│    📍 BLOCK71 Singapore                                        │
└────────────────────────────────────────────────────────────────┘
```

### Event Row Elements
| Element | Specification |
|---------|---------------|
| **Date Header** | Bullet + day name + date |
| **Time** | Left-aligned, muted |
| **Title** | Bold, main text |
| **Host** | Avatar(s) + "By {name}" |
| **Location** | Pin icon + venue name |
| **Thumbnail** | Right-aligned cover image |
| **Attendee Count** | Avatar stack + "+X" |
| **Status Badge** | "Sold Out" in red pill |

---

## 7. Design Tokens Extracted

### Colors (Discover)
| Token | Value | Usage |
|-------|-------|-------|
| `--sold-out` | `#ef4444` | Red "Sold Out" badge |
| `--city-icon-bg` | Various | City-specific colors |
| `--hero-overlay` | `rgba(0,0,0,0.4)` | Dark overlay on hero |
| `--subscribe-btn` | `#ffffff` | White button on hero |

### Typography
| Element | Specification |
|---------|---------------|
| **Page Title** | 32px, bold |
| **Section Header** | 18px, semibold |
| **Event Title** | 16px, semibold |
| **Event Meta** | 14px, regular, muted |
| **Date Header** | 14px, regular, with bullet |

### Component Patterns
| Pattern | Usage |
|---------|-------|
| **Hero with overlay** | City pages, immersive header |
| **Tab navigation** | Region filtering |
| **Grid cards** | City/event browsing |
| **Timeline list** | Chronological event display |
| **Command palette** | Quick navigation + search |

---

## 8. UX Patterns Summary

### Discovery Flow
1. Land on Discover page
2. Browse Popular Events (location-based)
3. Explore cities by region tab
4. Click city → dedicated city page
5. Subscribe for notifications

### Event Submission
- Paste Luma event link
- Auto-fetch event details
- Validate requirements
- Show clear error states
- Submit for editorial review

### Search & Navigation
- Command palette (⌘K pattern)
- Keyboard shortcuts for power users
- Grouped results by type
- Recent searches for quick access

### Social Proof
- Attendee avatars on cards
- "+X" count for overflow
- "Sold Out" urgency badge
- Host avatars build trust

### Localization
- City-specific pages
- Local timezone display
- Regional tab organization
- Multi-language support (implied)
