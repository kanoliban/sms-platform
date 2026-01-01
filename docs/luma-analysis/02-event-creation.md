# Event Creation Analysis

> **Category:** 02-event-creation (50 images)
> **Screens:** Event form, themes, modals, settings

---

## 1. Page Layout

### Two-Column Structure
```
┌─────────────────────────────────────────────────────────────┐
│  [Nav: Events | Calendars | Discover]     [Create Event] ▪  │
├───────────────────────┬─────────────────────────────────────┤
│                       │  [Calendar Dropdown]    [Visibility]│
│   ┌───────────────┐   │                                     │
│   │               │   │  Event Name (large input)           │
│   │  Cover Image  │   │                                     │
│   │   (16:9)      │   │  ┌─────────────────────────────────┐│
│   │               │   │  │ Start: [Date]  [Time]  [TZ]     ││
│   │      📷      │   │  │ End:   [Date]  [Time]           ││
│   └───────────────┘   │  └─────────────────────────────────┘│
│                       │                                     │
│   Theme: Minimal  ✏️   │  📍 Add Event Location              │
│                       │  📝 Add Description                 │
│                       │                                     │
│                       │  Event Options                      │
│                       │  ├─ 🎟️ Tickets: Free ✏️             │
│                       │  ├─ 🔐 Require Approval: [toggle]   │
│                       │  └─ 👥 Capacity: Unlimited ✏️       │
│                       │                                     │
│                       │  [████ Create Event ████]           │
└───────────────────────┴─────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Page Background** | Light blue/teal gradient (`#e8f4f8`) |
| **Content Width** | ~960px max, centered |
| **Left Column** | ~40% - Cover image + theme selector |
| **Right Column** | ~60% - Form fields |
| **Primary CTA** | Full-width teal button |

---

## 2. Cover Image Selector

### Image Picker Modal
| Element | Specification |
|---------|---------------|
| **Modal Width** | ~500px |
| **Header** | "Choose Image" with X close button |
| **Upload Area** | Gray dashed border, "Drag & drop or click here to upload" |
| **Search** | Full-width input with search icon + clear button |
| **Gallery Label** | "Designed by Luma" |
| **Grid** | 6 columns, square thumbnails |
| **Categories** | Tech, meetup, hackathon, AI, future, etc. |

**UX Pattern:** Search filters gallery in real-time; curated stock images remove friction.

---

## 3. Theme System

### Theme Picker (Bottom Sheet)
```
┌─────────────────────────────────────────────────────────────┐
│ ═══════════════════════════════════════════════════════════ │ (drag handle)
│                                                             │
│  [Minimal] [Quantum] [Warp] [Emoji] [Confetti] [Pattern] [Seasonal]
│     ○        ●        ○       ○        ○          ○         ○   NEW
│                                                             │
│  🎨 Color    Style      ═══      Ag Font      ☀️ Display    │
│    [Dreamy ▾] [▾]       ── +     [Default ▾]   [Light ▾]   │
└─────────────────────────────────────────────────────────────┘
```

### Theme Options

| Theme | Visual Style | Color Tint |
|-------|--------------|------------|
| **Minimal** | Clean lines, no decoration | Neutral grays |
| **Quantum** | Purple gradient background | Purple/Pink |
| **Warp** | Wavy gradient patterns | Multi-color |
| **Emoji** | Emoji decorations | Yellow/playful |
| **Confetti** | Scattered confetti shapes | Multi-color |
| **Pattern** | Geometric patterns | Custom |
| **Seasonal** | Holiday/seasonal themes | Varies |

### Theme Customization

| Option | Values |
|--------|--------|
| **Color** | Preset palette (Dreamy, Polaroid, etc.) + custom tint |
| **Style** | Theme-specific variations |
| **Font** | Default, Pearl, others |
| **Display** | Light / Dark |

---

## 4. Form Elements

### Calendar Selector Dropdown
```
┌────────────────────────────────────┐
│ Choose the calendar of the event: │
│                                    │
│ 👤 Personal Calendar               │
│ 📅 Demo Product Session     ✓     │
│ ─────────────────────────────────  │
│ + Create Calendar                  │
│   ⓘ Creating the event under a    │
│     calendar grants its admins     │
│     manage access.                 │
└────────────────────────────────────┘
```

### Visibility Dropdown
```
┌────────────────────────────────────┐
│ ● Public                     ✓    │
│   🌐 Shown on your calendar and   │
│      eligible to be featured.     │
│                                    │
│ ○ Private                         │
│   ✨ Unlisted. Only people with   │
│      the link can register.       │
└────────────────────────────────────┘
```

### Date & Time Picker

**Date Picker:**
| Element | Specification |
|---------|---------------|
| **Layout** | Calendar grid (month view) |
| **Header** | Month name + navigation arrows |
| **Days** | 7-column grid (S M T W T F S) |
| **Selection** | Pink/teal circle on selected date |
| **Disabled** | Gray text for past dates |

**Time Picker:**
| Element | Specification |
|---------|---------------|
| **Layout** | Scrollable dropdown list |
| **Intervals** | 30-minute increments |
| **Format** | 12-hour with AM/PM |
| **Selection** | Pink/teal highlight on selected time |

### Event Name Input
| Element | Specification |
|---------|---------------|
| **Style** | Large, minimal (no border, placeholder only) |
| **Placeholder** | "Event Name" in muted teal |
| **Font Size** | ~32px, serif/display font |
| **Placeholder Color** | `#6bb3b3` (muted teal) |

---

## 5. Location Types

### Virtual Location (Zoom)
```
┌─────────────────────────────────────────────┐
│ 📹 Zoom Meeting                          ✕ │
│    Auto-created by Luma                    │
└─────────────────────────────────────────────┘
```

**Zoom Integration Flow:**
1. Click "Add Event Location"
2. Select "Zoom" option
3. Show loading state ("Link Zoom" + spinner)
4. Auto-generate meeting link
5. Display "Auto-created by Luma" badge

### Physical Location (Google Maps)
```
┌─────────────────────────────────────────────┐
│ 📍 The MacArthur                         ✕ │
│    607 S Park View St, Los Angeles, CA...  │
│ ┌─────────────────────────────────────────┐│
│ │        [Google Maps Preview]            ││
│ │             📍                          ││
│ └─────────────────────────────────────────┘│
│ + Add Further Instructions                 │
└─────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Map Height** | ~120px |
| **Map Style** | Google Maps embed (muted colors) |
| **Marker** | Red pin on location |
| **Instructions** | Optional text field |

---

## 6. Event Options (Modals)

### Max Capacity Modal
```
┌────────────────────────────────────────────┐
│  👥                                        │
│                                            │
│  Max Capacity                              │
│                                            │
│  Auto-close registration when the capacity │
│  is reached. Only approved guests count    │
│  toward the cap.                           │
│                                            │
│  Capacity                                  │
│  ┌──────────────────────────────────────┐  │
│  │ 1000                                 │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Over-Capacity Waitlist         [toggle]   │
│                                            │
│  [Set Limit]  [Remove Limit]               │
└────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Modal Width** | ~400px |
| **Header Icon** | User group icon (outlined) |
| **Title** | "Max Capacity" |
| **Description** | Explanation of behavior |
| **Input** | Number input with default value |
| **Toggle** | Waitlist enable/disable |
| **Actions** | Primary "Set Limit" + Secondary "Remove Limit" |

### Require Approval Toggle
| State | Behavior |
|-------|----------|
| **Off** | Anyone can register immediately |
| **On** | Hosts must approve registrations |

---

## 7. Loading & Progress States

### Zoom Integration Loading
```
┌─────────────────────────────────────┐
│                                     │
│          Link Zoom                  │
│                                     │
│      ┌───────────────────────┐      │
│      │  ◌ (spinner)          │      │
│      └───────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Pattern:** Full-page takeover with centered loading indicator for OAuth flows.

---

## 8. Check-in Interface

### QR Scanner View
```
┌─────────────────────────────────────────────┐
│  ✦ Tech Meetup                    👥 Guests │
│    Started 17 hours ago                     │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │       [Camera Viewfinder]           │    │
│  │                                     │    │
│  │                              🔄     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  0 Checked In ━━━━━━━━━━━━━━━━━━  3 Going  │
│                                             │
│  • 1 Invited                                │
│                                             │
│  Manage Event Page ↗  [✓ Checked in.]      │
└─────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Header** | Event name + status + guest count toggle |
| **Camera** | Black viewfinder with refresh button |
| **Progress Bar** | Checked in vs. Going ratio |
| **Status Badge** | "1 Invited" blue dot indicator |
| **Success State** | Green "Checked in." button |

---

## 9. Design Tokens Extracted

### Colors (Event Creation)
| Token | Value | Usage |
|-------|-------|-------|
| `--page-bg` | `#e8f4f8` | Page background |
| `--input-placeholder` | `#6bb3b3` | Muted teal for placeholders |
| `--theme-quantum` | `linear-gradient(135deg, #d8b4fe, #f9a8d4)` | Purple/pink theme |
| `--btn-primary` | `#14b8a6` | Teal create button |
| `--btn-primary-hover` | `#0d9488` | Darker teal |
| `--date-selected` | `#ec4899` | Pink date selection |
| `--time-selected` | `#f43f5e` | Red/pink time highlight |
| `--success` | `#22c55e` | Green check-in success |

### Component Patterns
| Pattern | Usage |
|---------|-------|
| **Bottom Sheet** | Theme picker, options |
| **Dropdown with Description** | Calendar, visibility selectors |
| **Inline Toggle** | Require approval, waitlist |
| **Dismissible Chip** | Location (Zoom, address) with X |
| **Progress Bar** | Check-in status |

---

## 10. UX Patterns Summary

### Progressive Disclosure
- Start with minimal required fields (name, date)
- "Add" buttons for optional fields (location, description)
- Options expand via modals (capacity, tickets)

### Smart Defaults
- Visibility defaults to "Public"
- Capacity defaults to "Unlimited"
- Tickets default to "Free"
- Theme defaults to "Minimal"

### Integration Patterns
- Zoom: OAuth flow → auto-create meeting
- Google Maps: Address autocomplete → embedded preview
- Calendar: Select existing or create new

### Visual Feedback
- Theme changes update preview in real-time
- Date/time selection highlighted with accent colors
- Loading states for async operations (Zoom linking)
- Success states after actions (check-in)
